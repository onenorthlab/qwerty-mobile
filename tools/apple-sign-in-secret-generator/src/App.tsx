import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { importPKCS8, SignJWT } from 'jose';
import { ChevronRight, ChevronLeft, Copy, CheckCircle2, KeyRound, ShieldCheck, FileKey, User, Check, AlertCircle, Upload } from 'lucide-react';

type Step = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Team ID',
    description: '10 位字符的开发者团队标识',
    icon: <User className="w-6 h-6" />,
  },
  {
    id: 2,
    title: 'Client ID',
    description: 'Services ID (例如 com.yourdomain.app.signin)',
    icon: <ShieldCheck className="w-6 h-6" />,
  },
  {
    id: 3,
    title: 'Key ID',
    description: '10 位字符的密钥标识',
    icon: <KeyRound className="w-6 h-6" />,
  },
  {
    id: 4,
    title: 'Private Key',
    description: '从 Apple 下载的 .p8 私钥文件内容',
    icon: <FileKey className="w-6 h-6" />,
  },
  {
    id: 5,
    title: 'Generate',
    description: '生成最终的 Secret Key (JWT)',
    icon: <CheckCircle2 className="w-6 h-6" />,
  },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    teamId: '',
    clientId: '',
    keyId: '',
    privateKey: '',
  });
  const [generatedSecret, setGeneratedSecret] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFormData((prev) => ({ ...prev, privateKey: content }));
      setError('');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError('');
    }
  };

  const generateSecret = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const alg = 'ES256';
      
      // Clean up the private key string (remove extra spaces, ensure correct format)
      let pk = formData.privateKey.trim();
      if (!pk.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('私钥格式不正确，必须包含 "-----BEGIN PRIVATE KEY-----"');
      }

      const privateKey = await importPKCS8(pk, alg);
      
      const now = Math.floor(Date.now() / 1000);
      const exp = now + (180 * 24 * 60 * 60); // 180 days (approx 6 months)
      
      const jwt = await new SignJWT({
        iss: formData.teamId.trim(),
        iat: now,
        exp: exp,
        aud: 'https://appleid.apple.com',
        sub: formData.clientId.trim(),
      })
        .setProtectedHeader({ alg, kid: formData.keyId.trim() })
        .sign(privateKey);
        
      setGeneratedSecret(jwt);
      nextStep();
    } catch (err: any) {
      setError(err.message || '生成失败，请检查输入的信息是否正确。');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.teamId.trim().length > 0;
      case 2: return formData.clientId.trim().length > 0;
      case 3: return formData.keyId.trim().length > 0;
      case 4: return formData.privateKey.trim().length > 0;
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">输入 Team ID</h2>
              <p className="text-gray-500">
                登录 <a href="https://developer.apple.com/account/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Apple Developer 后台</a>，在右上角你的名字旁边，或者在 <a href="https://developer.apple.com/account/#!/membership" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Membership 详情页</a>里找到的 10 位字符。
              </p>
            </div>
            <div>
              <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-2">
                Team ID
              </label>
              <input
                type="text"
                id="teamId"
                name="teamId"
                value={formData.teamId}
                onChange={handleInputChange}
                placeholder="例如: ABCDE12345"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                autoFocus
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">输入 Client ID</h2>
              <p className="text-gray-500">
                在 <a href="https://developer.apple.com/account/resources/identifiers/list" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Certificates, Identifiers & Profiles -{'>'} Identifiers</a> 中创建的 Services ID。
                <br />
                <span className="text-sm text-amber-600 mt-1 block">
                  注意：必须在后台勾选并配置 Sign in with Apple，填入你的授权回调域名。
                </span>
              </p>
            </div>
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                Client ID (Services ID)
              </label>
              <input
                type="text"
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                placeholder="例如: com.yourdomain.app.signin"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                autoFocus
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">输入 Key ID</h2>
              <p className="text-gray-500">
                在 <a href="https://developer.apple.com/account/resources/authkeys/list" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Keys 菜单</a>中创建的新 Key，勾选 Sign in with Apple 并绑定 Primary App ID 后生成的 10 位字符。
              </p>
            </div>
            <div>
              <label htmlFor="keyId" className="block text-sm font-medium text-gray-700 mb-2">
                Key ID
              </label>
              <input
                type="text"
                id="keyId"
                name="keyId"
                value={formData.keyId}
                onChange={handleInputChange}
                placeholder="例如: 12345ABCDE"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                autoFocus
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">输入 Private Key</h2>
              <p className="text-gray-500">
                创建 Key 成功后下载的 .p8 私钥文件内容。您可以直接粘贴内容，或者拖拽/上传 .p8 文件。
                <br />
                <span className="text-sm text-green-600 mt-1 block">
                  安全提示：此工具完全在浏览器本地运行，您的私钥不会被上传到任何服务器。
                </span>
              </p>
            </div>
            <div 
              className="relative group"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700">
                  .p8 文件内容
                </label>
                <label className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  上传文件
                  <input 
                    type="file" 
                    accept=".p8,.txt" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                      e.target.value = '';
                    }} 
                  />
                </label>
              </div>
              <div className="relative">
                <textarea
                  id="privateKey"
                  name="privateKey"
                  value={formData.privateKey}
                  onChange={handleInputChange}
                  placeholder={`-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----\n\n或者将 .p8 文件拖拽到此处`}
                  rows={8}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none font-mono text-sm resize-none ${isDragging ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                  autoFocus
                />
                {isDragging && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl border-2 border-dashed border-black">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-black animate-bounce" />
                      <p className="font-medium text-black">松开鼠标以读取文件</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Secret Key 生成成功！</h2>
              <p className="text-gray-500">
                此 JWT 的有效期已设置为 6 个月（Apple 允许的最大值）。过期后请重新使用此工具生成。
              </p>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl border border-gray-200" />
              <div className="relative p-6">
                <p className="font-mono text-sm text-gray-800 break-all leading-relaxed">
                  {generatedSecret}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed">
              <p className="font-semibold mb-1">下一步：</p>
              <p>
                将此 JWT 字符串作为 <code className="bg-blue-100 px-1.5 py-0.5 rounded">client_secret</code> 参数，与其他参数（如 client_id, code, grant_type, redirect_uri）一起，向 <code className="bg-blue-100 px-1.5 py-0.5 rounded">https://appleid.apple.com/auth/token</code> 发送 POST 请求，换取 Access Token 或 ID Token。
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-black selection:text-white pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Apple Sign-In Secret Generator</h1>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Local & Secure
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12">
          
          {/* Sidebar / Steps Indicator */}
          <div className="hidden md:block">
            <div className="sticky top-32">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Configuration Steps</h3>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {STEPS.map((step, index) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="relative flex items-center gap-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 z-10 transition-colors duration-300 bg-white
                        ${isActive ? 'border-black text-black' : isCompleted ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400'}
                      `}>
                        {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
                      </div>
                      <div>
                        <p className={`font-medium transition-colors duration-300 ${isActive ? 'text-black' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1" title={step.description}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
            
            {/* Mobile Step Indicator */}
            <div className="md:hidden px-8 pt-8 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
                <span>Step {currentStep} of {STEPS.length}</span>
                <span>{STEPS[currentStep - 1].title}</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-black transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex-1 p-8 md:p-12 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            {currentStep < 5 && (
              <div className="p-6 md:px-12 md:py-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
                    currentStep === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一步
                </button>
                
                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                      !isStepValid()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800 hover:shadow-md active:scale-[0.98]'
                    }`}
                  >
                    下一步
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={generateSecret}
                    disabled={!isStepValid() || isGenerating}
                    className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                      !isStepValid() || isGenerating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800 hover:shadow-md active:scale-[0.98]'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        生成 Secret Key
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            
            {currentStep === 5 && (
              <div className="p-6 md:px-12 md:py-8 bg-gray-50 border-t border-gray-100 flex items-center justify-center mt-auto">
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setFormData({ teamId: '', clientId: '', keyId: '', privateKey: '' });
                    setGeneratedSecret('');
                  }}
                  className="text-gray-500 hover:text-gray-900 font-medium transition-colors underline underline-offset-4"
                >
                  重新生成
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
