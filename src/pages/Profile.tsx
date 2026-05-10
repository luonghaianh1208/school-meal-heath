import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { User, Phone, Mail, Shield, BookOpen, Save, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export default function Profile() {
  const { appUser, user } = useAuth();
  const { toast } = useToast();
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Form State - Info
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  // Form State - Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form Errors
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (appUser) {
      setDisplayName(appUser.displayName || '');
      setPhone(appUser.phone || '');
    }
  }, [appUser]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    // Validate phone (10 digits)
    if (phone && !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone) && phone.length !== 10 && !/^\d{10}$/.test(phone)) {
       setPhoneError('Số điện thoại không hợp lệ (Phải đủ 10 số)');
       return;
    }
    // simplified 10 digit validation
    if (phone && !/^\d{10}$/.test(phone)) {
        setPhoneError('Số điện thoại phải bao gồm đúng 10 chữ số');
        return;
    }

    if (!appUser) return;

    try {
      setIsSavingInfo(true);
      const userRef = doc(db, 'users', appUser.uid);
      await updateDoc(userRef, {
        displayName,
        phone
      });
      toast('Cập nhật thông tin thành công', 'success');
      // Update appUser context manually or rely on refresh, here we rely on the listener if it updates or simple reload.
      // Alternatively, the toast is enough and next load it updates.
    } catch (error) {
      console.error('Error updating profile:', error);
      toast('Có lỗi xảy ra khi cập nhật thông tin', 'error');
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      setIsSavingPassword(true);
      await updatePassword(currentUser, newPassword);
      toast('Đổi mật khẩu thành công', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/requires-recent-login') {
        setPasswordError('Phiên đăng nhập đã cũ. Vui lòng đăng xuất và đăng nhập lại để đổi mật khẩu.');
        toast('Phiên đăng nhập hết hạn', 'error');
      } else {
        toast('Có lỗi xảy ra khi đổi mật khẩu', 'error');
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (!appUser) return <div className="p-8">Đang tải thông tin...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ Cá nhân</h1>
        <p className="text-slate-500 mt-1">Quản lý thông tin tài khoản và bảo mật</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Read Only Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-green-50 flex flex-col items-center border-b border-green-100">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-md">
                {appUser.displayName?.charAt(0).toUpperCase() || appUser.email?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{appUser.displayName}</h2>
              <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                appUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {appUser.role === 'admin' ? '👑 Ban Giám Hiệu' : '📚 Giáo viên'}
              </span>
            </div>
            
            <div className="p-4 space-y-4 text-sm">
              <div className="flex items-center text-slate-600">
                <Mail className="w-4 h-4 mr-3 text-slate-400" />
                <span className="truncate">{appUser.email}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <Shield className="w-4 h-4 mr-3 text-slate-400" />
                <span>Vai trò: {appUser.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}</span>
              </div>
              {appUser.role === 'teacher' && (
                <div className="flex items-start text-slate-600">
                  <BookOpen className="w-4 h-4 mr-3 mt-0.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="block font-medium mb-1">Lớp phụ trách:</span>
                    {appUser.assignedClasses && appUser.assignedClasses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {appUser.assignedClasses.map(c => (
                          <span key={c} className="px-2 py-0.5 bg-slate-100 rounded text-xs border border-slate-200">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa được phân công</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Editable Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Info Update Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Cập nhật Thông tin
            </h3>
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Họ và Tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      // Only allow digits
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                      setPhoneError('');
                    }}
                    maxLength={10}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      phoneError ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="Nhập 10 số điện thoại"
                  />
                </div>
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {phoneError}
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingInfo || !displayName || !phone}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  {isSavingInfo ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>

          {/* Password Change Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2 text-slate-600" />
              Đổi Mật khẩu
            </h3>
            
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                <p>{passwordError}</p>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  placeholder="Nhập lại mật khẩu mới"
                  minLength={6}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword || !newPassword || !confirmPassword}
                  className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  {isSavingPassword ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Cập nhật Mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
