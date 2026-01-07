import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signup } from '../shared/api/authApi';
import { DatePicker } from '../shared/components/DatePicker';
import { useAlert } from '../shared/hooks/useAlert';
import { getErrorMessage } from '../shared/utils/errorHandler';

export const Signup = () => {
  const navigate = useNavigate();
  const { showAlert, AlertComponent } = useAlert();

  // 필수 필드
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');

  // 선택 필드
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [bio, setBio] = useState('');

  // 회원가입 mutation
  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      showAlert('회원가입이 완료되었습니다.\n로그인 페이지로 이동합니다.', () => {
        navigate('/login');
      });
    },
    onError: async (error) => {
      const message = await getErrorMessage(error);
      showAlert(message);
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;

    // HTML5 기본 검증 확인
    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(':invalid') as HTMLInputElement;
      if (firstInvalid) {
        // label을 찾기 위해 부모 div에서 label 요소 찾기
        const parentDiv = firstInvalid.closest('div');
        const labelElement = parentDiv?.querySelector('label');
        const fieldName = labelElement?.textContent?.replace(' *', '') || '입력 항목';

        const minLength = firstInvalid.minLength;
        const maxLength = firstInvalid.maxLength;
        const currentLength = firstInvalid.value.length;

        let message = `${fieldName}을 확인해주세요.`;

        // 길이 제한이 있는 경우
        if (minLength > 0 || maxLength > 0) {
          message += `\n(현재 ${currentLength}자를 사용하고 있습니다)`;
        }

        showAlert(message);
      }
      return;
    }

    // 닉네임 유효성 검사 (2~10자)
    if (nickname.length < 2 || nickname.length > 10) {
      showAlert('닉네임은 2자 이상 10자 이하로 입력해주세요.');
      return;
    }

    // 비밀번호 유효성 검사 (8~20자, 영문+숫자 포함)
    if (password.length < 8 || password.length > 20) {
      showAlert('비밀번호는 8자 이상 20자 이하로 입력해주세요.');
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
      showAlert('비밀번호는 영문자와 숫자를 모두 포함해야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 만 19세 이상 확인
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (actualAge < 19) {
      showAlert('만 19세 이상만 가입할 수 있습니다.');
      return;
    }

    // API 호출
    signupMutation.mutate({
      email,
      password,
      nickname,
      birthDate,
      profileImageUrl: undefined, // TODO: 이미지 업로드 구현 후 URL 추가
      gender: gender || 'other', // "male", "female", "other" (소문자)
      bio: bio || undefined,
    });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleOAuthSignup = () => {
    showAlert('소셜 로그인 기능은 추후 구현 예정입니다.');
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(180, 160, 134, 0.3)',
    background: 'rgba(15, 15, 20, 0.6)',
    color: '#E8DCC0',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 0.3s',
    fontFamily: "'Noto Serif KR', serif",
    boxSizing: 'border-box' as const
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#D4C5A9',
    marginBottom: '0.5rem',
    fontFamily: "'Noto Serif KR', serif"
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '3rem',
      paddingBottom: '3rem'
    }}>
      {/* Background Image */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/Signup.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(1px) brightness(0.5)',
        zIndex: -2
      }} />

      {/* Dark Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at top, rgba(234, 145, 78, 0.12) 0%, transparent 50%), linear-gradient(180deg, rgba(15, 15, 20, 0.5) 0%, rgba(10, 10, 15, 0.7) 100%)',
        zIndex: -1
      }} />

      {/* Signup Container */}
      <div style={{
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2.5rem',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}>
          <img
            src="/janchwi-logo.png"
            alt="잔취"
            style={{
              width: '100px',
              height: '100px',
              margin: '0 auto',
              objectFit: 'contain'
            }}
          />
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '500',
            color: '#D4C5A9',
            marginTop: '0.75rem',
            fontFamily: "'Noto Serif KR', serif"
          }}>
            잔취
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#A39178',
            marginTop: '0.5rem',
            fontFamily: "'Noto Serif KR', serif"
          }}>
            당신의 여운을 남겨보세요
          </p>
        </div>

        {/* Signup Form */}
        <div style={{
          background: 'rgba(20, 20, 25, 0.6)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          border: '1px solid rgba(180, 160, 134, 0.2)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#D4C5A9',
            marginBottom: '1.5rem',
            fontFamily: "'Noto Serif KR', serif"
          }}>
            필수 정보
          </h2>

          <form onSubmit={handleSignup} noValidate>
            {/* Email Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>이메일 *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.6)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.3)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.6)';
                }}
              />
              <p style={{
                fontSize: '0.75rem',
                color: '#A39178',
                marginTop: '0.375rem',
                fontFamily: "'Noto Serif KR', serif"
              }}>
                가입 후 이메일 인증이 필요합니다
              </p>
            </div>

            {/* Nickname Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>닉네임 *</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="사용할 닉네임을 입력하세요"
                required
                minLength={2}
                maxLength={10}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.6)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.3)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.6)';
                }}
              />
              <p style={{
                fontSize: '0.75rem',
                color: '#A39178',
                marginTop: '0.375rem',
                fontFamily: "'Noto Serif KR', serif"
              }}>
                2자 이상 10자 이하로 입력해주세요
              </p>
            </div>

            {/* Birth Date Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>생년월일 *</label>
              <DatePicker
                value={birthDate}
                onChange={setBirthDate}
                placeholder="생년월일을 선택하세요"
              />
              <p style={{
                fontSize: '0.75rem',
                color: '#A39178',
                marginTop: '0.375rem',
                fontFamily: "'Noto Serif KR', serif"
              }}>
                만 19세 이상만 가입 가능합니다
              </p>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>비밀번호 *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                maxLength={20}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.6)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.3)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.6)';
                }}
              />
              <p style={{
                fontSize: '0.75rem',
                color: '#A39178',
                marginTop: '0.375rem',
                fontFamily: "'Noto Serif KR', serif"
              }}>
                영문자와 숫자를 포함하여 8~20자로 입력해주세요
              </p>
            </div>

            {/* Confirm Password Input */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>비밀번호 확인 *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.6)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(180, 160, 134, 0.3)';
                  e.target.style.background = 'rgba(15, 15, 20, 0.6)';
                }}
              />
              {confirmPassword && (
                <p style={{
                  fontSize: '0.75rem',
                  color: password === confirmPassword ? '#6FBA82' : '#E57373',
                  marginTop: '0.375rem',
                  fontFamily: "'Noto Serif KR', serif"
                }}>
                  {password === confirmPassword ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
                </p>
              )}
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'rgba(180, 160, 134, 0.2)',
              margin: '2rem 0'
            }} />

            {/* Optional Fields Section */}
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#D4C5A9',
              marginBottom: '0.5rem',
              fontFamily: "'Noto Serif KR', serif"
            }}>
              추가 정보 (선택)
            </h2>
            <p style={{
              fontSize: '0.75rem',
              color: '#A39178',
              marginBottom: '1.5rem',
              fontFamily: "'Noto Serif KR', serif"
            }}>
              더 나은 추천을 위해 정보를 입력해주세요
            </p>

            {/* Profile Image Upload */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>프로필 사진</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  id="profile-image-upload"
                  style={{
                    position: 'absolute',
                    width: '0.1px',
                    height: '0.1px',
                    opacity: 0,
                    overflow: 'hidden',
                    zIndex: -1
                  }}
                />
                <label
                  htmlFor="profile-image-upload"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(180, 160, 134, 0.3)',
                    background: 'rgba(15, 15, 20, 0.6)',
                    color: '#D4C5A9',
                    fontSize: '0.875rem',
                    fontFamily: "'Noto Serif KR', serif",
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.6)';
                    e.currentTarget.style.background = 'rgba(180, 160, 134, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.3)';
                    e.currentTarget.style.background = 'rgba(15, 15, 20, 0.6)';
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>📷</span>
                  {profileImage ? '사진 변경하기' : '사진 선택하기'}
                </label>
              </div>
              {profileImage && (
                <p style={{
                  fontSize: '0.75rem',
                  color: '#D4C5A9',
                  marginTop: '0.375rem',
                  fontFamily: "'Noto Serif KR', serif"
                }}>
                  선택된 파일: {profileImage.name}
                </p>
              )}
            </div>

            {/* Gender Selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>성별</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { value: 'male', label: '남성' },
                  { value: 'female', label: '여성' },
                  { value: 'other', label: '기타' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGender(option.value as typeof gender)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '0.75rem',
                      border: `1px solid ${gender === option.value ? 'rgba(180, 160, 134, 0.8)' : 'rgba(180, 160, 134, 0.3)'}`,
                      background: gender === option.value ? 'rgba(180, 160, 134, 0.3)' : 'rgba(15, 15, 20, 0.6)',
                      color: '#E8DCC0',
                      fontSize: '0.875rem',
                      fontFamily: "'Noto Serif KR', serif",
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>자기소개 (최대 50자)</label>
              <textarea
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= 50) {
                    setBio(e.target.value);
                  }
                }}
                placeholder="간단한 자기소개를 작성해주세요"
                rows={3}
                maxLength={50}
                style={{
                  ...inputStyle,
                  resize: 'none',
                  height: '90px'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.6)';
                  e.currentTarget.style.background = 'rgba(15, 15, 20, 0.8)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.3)';
                  e.currentTarget.style.background = 'rgba(15, 15, 20, 0.6)';
                }}
              />
              <p style={{
                fontSize: '0.75rem',
                color: '#A39178',
                marginTop: '0.375rem',
                textAlign: 'right',
                fontFamily: "'Noto Serif KR', serif"
              }}>
                {bio.length} / 50
              </p>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={signupMutation.isPending}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(180, 160, 134, 0.5)',
                background: signupMutation.isPending ? 'rgba(180, 160, 134, 0.2)' : 'rgba(180, 160, 134, 0.3)',
                backdropFilter: 'blur(10px)',
                color: '#E8DCC0',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: signupMutation.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                fontFamily: "'Noto Serif KR', serif",
                opacity: signupMutation.isPending ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!signupMutation.isPending) {
                  e.currentTarget.style.background = 'rgba(180, 160, 134, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!signupMutation.isPending) {
                  e.currentTarget.style.background = 'rgba(180, 160, 134, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(180, 160, 134, 0.5)';
                }
              }}
            >
              {signupMutation.isPending ? '가입 중...' : '회원가입'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '2rem 0',
            gap: '1rem'
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'rgba(180, 160, 134, 0.2)'
            }} />
            <span style={{
              fontSize: '0.875rem',
              color: '#A39178',
              fontFamily: "'Noto Serif KR', serif"
            }}>
              간편 가입
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'rgba(180, 160, 134, 0.2)'
            }} />
          </div>

          {/* OAuth Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Kakao */}
            <button
              onClick={handleOAuthSignup}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: '#FEE500',
                color: '#000000',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontFamily: "'Noto Serif KR', serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FDD835';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FEE500';
              }}
            >
              <img src="/kakao.png" alt="Kakao" style={{ width: '20px', height: '20px' }} />
              카카오로 시작하기
            </button>

            {/* Naver */}
            <button
              onClick={handleOAuthSignup}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: '#03C75A',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontFamily: "'Noto Serif KR', serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#02B350';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#03C75A';
              }}
            >
              <img src="/naver.png" alt="Naver" style={{ width: '20px', height: '20px' }} />
              네이버로 시작하기
            </button>

            {/* Google */}
            <button
              onClick={handleOAuthSignup}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(180, 160, 134, 0.3)',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#1f1f1f',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontFamily: "'Noto Serif KR', serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              }}
            >
              <img src="/google.png" alt="Google" style={{ width: '20px', height: '20px' }} />
              Google로 시작하기
            </button>
          </div>

          {/* Login Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '2rem'
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#A39178',
              fontFamily: "'Noto Serif KR', serif"
            }}>
              이미 계정이 있으신가요?{' '}
            </span>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#D4C5A9',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontFamily: "'Noto Serif KR', serif"
              }}
            >
              로그인
            </button>
          </div>
        </div>
      </div>

      {/* Alert Component */}
      {AlertComponent}
    </div>
  );
};
