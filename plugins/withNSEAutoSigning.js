/**
 * Config plugin: enable automatic code signing for the OneSignal
 * Notification Service Extension (NSE) target.
 *
 * Without this, `npx expo run:ios --device` fails with:
 *   "No profiles for '…OneSignalNotificationServiceExtension' were found"
 *
 * What it does:
 *   - Finds the OneSignalNotificationServiceExtension PBX target
 *   - Sets CODE_SIGN_STYLE = Automatic in all its build configurations
 *   - Sets DEVELOPMENT_TEAM from the APPLE_TEAM_ID env var (if provided)
 *
 * Usage: add to plugins array in app.config.ts (already done).
 * Requires: APPLE_TEAM_ID in .env or environment
 */
const fs = require('fs');
const path = require('path');
const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');

const NSE_TARGET_NAME = 'OneSignalNotificationServiceExtension';
const PODFILE_NORMALIZE_MARKER = '[withNSEAutoSigning] Normalize pod deployment targets';

function normalizeTargetName(name) {
  return typeof name === 'string' ? name.replace(/^"|"$/g, '') : '';
}

function withPodfileDeploymentTarget(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      if (!fs.existsSync(podfilePath)) return cfg;

      const minIosVersion = cfg.ios?.deploymentTarget ?? '15.1';
      let source = fs.readFileSync(podfilePath, 'utf8');

      if (!source.includes('min_ios_version = podfile_properties')) {
        source = source.replace(
          /(podfile_properties = .*?\n)/,
          `$1min_ios_version = podfile_properties['ios.deploymentTarget'] || '${minIosVersion}'\n`,
        );
      }

      source = source.replace(/platform :ios, [^\n]+\n/, 'platform :ios, min_ios_version\n');

      if (!source.includes(PODFILE_NORMALIZE_MARKER)) {
        source = source.replace(
          /(react_native_post_install\([\s\S]*?:ccache_enabled => ccache_enabled\?\(podfile_properties\),\n\s*\)\n)/,
          `$1\n    # ${PODFILE_NORMALIZE_MARKER}.\n    installer.pods_project.targets.each do |target|\n      target.build_configurations.each do |build_config|\n        build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = min_ios_version\n      end\n    end\n`,
        );
      }

      fs.writeFileSync(podfilePath, source);
      return cfg;
    },
  ]);
}

/** @param {import('@expo/config-plugins').ExpoConfig} config */
module.exports = function withNSEAutoSigning(config) {
  const withPodfilePatched = withPodfileDeploymentTarget(config);
  return withXcodeProject(withPodfilePatched, (cfg) => {
    const xcodeProject = cfg.modResults;
    const teamId = process.env.APPLE_TEAM_ID ?? '';
    const minIosVersion = cfg.ios?.deploymentTarget ?? '15.1';

    // Find the NSE native target key
    const nativeTargets = xcodeProject.pbxNativeTargetSection();
    let nseTargetKey = null;

    for (const [key, target] of Object.entries(nativeTargets)) {
      if (key.endsWith('_comment')) continue;
      if (!target || typeof target !== 'object') continue;

      const commentName = normalizeTargetName(nativeTargets[`${key}_comment`]);
      const targetName = normalizeTargetName(target.name);

      if (commentName === NSE_TARGET_NAME || targetName === NSE_TARGET_NAME) {
        nseTargetKey = key;
        break;
      }
    }

    if (!nseTargetKey) {
      return cfg;
    }

    // Traverse: target → configurationList → buildConfigurations
    const nseTarget = nativeTargets[nseTargetKey];
    const configListKey =
      typeof nseTarget.buildConfigurationList === 'object'
        ? nseTarget.buildConfigurationList.value
        : nseTarget.buildConfigurationList;
    const configLists = xcodeProject.pbxXCConfigurationList();
    const configList = configLists[configListKey];

    if (!configList) return cfg;

    const buildConfigs = xcodeProject.pbxXCBuildConfigurationSection();

    for (const ref of configList.buildConfigurations ?? []) {
      const buildConfigKey = typeof ref === 'object' ? ref.value : ref;
      const buildConfig = buildConfigs[buildConfigKey];

      if (!buildConfig?.buildSettings) continue;

      buildConfig.buildSettings.CODE_SIGN_STYLE = 'Automatic';
      buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = minIosVersion;

      if (teamId) {
        buildConfig.buildSettings.DEVELOPMENT_TEAM = teamId;
      }

      // Remove stale manual provisioning settings that block automatic signing
      delete buildConfig.buildSettings.PROVISIONING_PROFILE;
      delete buildConfig.buildSettings.PROVISIONING_PROFILE_SPECIFIER;
    }

    console.log(
      `[withNSEAutoSigning] Set CODE_SIGN_STYLE=Automatic and IPHONEOS_DEPLOYMENT_TARGET=${minIosVersion} on "${NSE_TARGET_NAME}"` +
        (teamId ? ` (DEVELOPMENT_TEAM=${teamId})` : ' (no APPLE_TEAM_ID — set it in .env)'),
    );

    return cfg;
  });
};
