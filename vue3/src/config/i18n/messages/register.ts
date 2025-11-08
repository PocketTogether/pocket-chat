import type { I18nMessagesSatisfiesType } from '.'
/**
 * i18nMessages 注册相关部分
 */
export const i18nMessagesRegisterPart = {
  registerRulesUsernameRequiredMessage: {
    'en-US': () => 'Please enter username' as const,
    'zh-CN': () => '请输入用户名' as const,
    'zh-TW': () => '請輸入用戶名' as const,
  },
  registerRulesUsernamePatternCharMessage: {
    'en-US': () => 'Only letters, numbers, and underscores.' as const,
    'zh-CN': () => '仅支持字母、数字和下划线。' as const,
    'zh-TW': () => '僅支援字母、數字和底線。' as const,
  },
  registerRulesUsernamePatternLengthMessage: {
    'en-US': () => '1-32 characters.' as const,
    'zh-CN': () => '1-32个字符。' as const,
    'zh-TW': () => '1-32個字元。' as const,
  },
  registerRulesPasswordRequiredMessage: {
    'en-US': () => 'Please enter password' as const,
    'zh-CN': () => '请输入密码' as const,
    'zh-TW': () => '請輸入密碼' as const,
  },
  registerRulesPasswordPatternMessage: {
    'en-US': () => 'Password must be at least 8 characters' as const,
    'zh-CN': () => '密码必须至少包含 8 个字符' as const,
    'zh-TW': () => '密碼必須至少包含 8 個字符' as const,
  },
  registerPlaceholderUsername: {
    'en-US': () => 'Please enter username' as const,
    'zh-CN': () => '请输入用户名' as const,
    'zh-TW': () => '請輸入用戶名' as const,
  },
  registerPlaceholderPassword: {
    'en-US': () => 'Please enter password' as const,
    'zh-CN': () => '请输入密码' as const,
    'zh-TW': () => '請輸入密碼' as const,
  },
  registerPlaceholderEmail: {
    'en-US': () => 'Please enter email' as const,
    'zh-CN': () => '请输入邮箱' as const,
    'zh-TW': () => '請輸入信​​箱' as const,
  },
  registerPlaceholderPasswordConfirm: {
    'en-US': () => 'Please confirm password' as const,
    'zh-CN': () => '请确认密码' as const,
    'zh-TW': () => '請確認密碼' as const,
  },
  registerButtonText: {
    'en-US': () => 'Sign up' as const,
    'zh-CN': () => '注 册' as const,
    'zh-TW': () => '註 冊' as const,
  },
  registerRulesPasswordConfirmRequiredMessage: {
    'en-US': () => 'Please confirm password' as const,
    'zh-CN': () => '请确认密码' as const,
    'zh-TW': () => '請確認密碼' as const,
  },
  registerRulesPasswordConfirmValidatorMessage: {
    'en-US': () => 'The two passwords you entered do not match.' as const,
    'zh-CN': () => '两次密码输入不一致' as const,
    'zh-TW': () => '兩次密碼輸入不一致' as const,
  },
  registerRulesEmailRequiredMessage: {
    'en-US': () => 'Please enter email' as const,
    'zh-CN': () => '请输入邮箱' as const,
    'zh-TW': () => '請輸入信​​箱' as const,
  },
  registerRulesEmailTypeMessage: {
    'en-US': () => 'Incorrect email format' as const,
    'zh-CN': () => '邮箱格式不正确' as const,
    'zh-TW': () => '信​​箱格式不正確' as const,
  },
  registerRulesUsernameValidatorNotUnique: {
    'en-US': () => 'Username already exists' as const,
    'zh-CN': () => '用户名已存在' as const,
    'zh-TW': () => '用戶名已存在' as const,
  },
  registerRulesEmailValidatorNotUnique: {
    'en-US': () => 'Email already exists' as const,
    'zh-CN': () => '邮箱已存在' as const,
    'zh-TW': () => '信​​箱已存在' as const,
  },
  registerFailedErrorUnknow: {
    'en-US': () => 'Sign-up failed' as const,
    'zh-CN': () => '注册失败' as const,
    'zh-TW': () => '註冊失敗' as const,
  },
  registerSuccess: {
    'en-US': () => 'Sign-up complete' as const,
    'zh-CN': () => '注册成功' as const,
    'zh-TW': () => '註冊成功' as const,
  },
} as const satisfies I18nMessagesSatisfiesType
