import type { I18nMessagesSatisfiesType } from '.'

/**
 * i18nMessages 文件相关部分
 */
export const i18nMessagesFilePart = {
  // 上传文件组件（点击后即可上传文件）显示的文字
  filePageFileUploadText: {
    'en-US': () => 'Upload File' as const,
    'zh-CN': () => '上传文件' as const,
    'zh-TW': () => '上傳檔案' as const,
    'ja-JP': () => 'ファイルをアップロード' as const,
    'ko-KR': () => '파일 업로드' as const,
    'ru-RU': () => 'Загрузить файл' as const,
  },

  // 登录后才能上传文件的提示
  filePageFileLoginText: {
    'en-US': () => 'Log in to upload files' as const,
    'zh-CN': () => '登录后即可上传文件' as const,
    'zh-TW': () => '登入後即可上傳檔案' as const,
    'ja-JP': () => 'ログインしてファイルをアップロード' as const,
    'ko-KR': () => '로그인 후 파일을 업로드할 수 있습니다' as const,
    'ru-RU': () => 'Войдите, чтобы загружать файлы' as const,
  },

  filePageAllFileText: {
    'en-US': () => 'All Files' as const,
    'zh-CN': () => '全部文件' as const,
    'zh-TW': () => '全部檔案' as const,
    'ja-JP': () => 'すべてのファイル' as const,
    'ko-KR': () => '모든 파일' as const,
    'ru-RU': () => 'Все файлы' as const,
  },

  filePageMyFileText: {
    'en-US': () => 'My Files' as const,
    'zh-CN': () => '我的文件' as const,
    'zh-TW': () => '我的檔案' as const,
    'ja-JP': () => '自分のファイル' as const,
    'ko-KR': () => '내 파일' as const,
    'ru-RU': () => 'Мои файлы' as const,
  },

  filePageSearchPlaceholderText: {
    'en-US': () => 'Search filename, keywords, username' as const,
    'zh-CN': () => '搜索文件名、关键词、用户名' as const,
    'zh-TW': () => '搜尋檔名、關鍵詞、用戶名' as const,
    'ja-JP': () => 'ファイル名、キーワード、ユーザー名を検索' as const,
    'ko-KR': () => '파일명, 키워드, 사용자명 검색' as const,
    'ru-RU': () =>
      'Поиск имени файла, ключевых слов, имени пользователя' as const,
  },

  // 文件上传列表标题
  filePageFileUploadListTitle: {
    'en-US': () => 'Upload File' as const,
    'zh-CN': () => '上传文件' as const,
    'zh-TW': () => '上傳檔案' as const,
    'ja-JP': () => 'ファイルをアップロード' as const,
    'ko-KR': () => '파일 업로드' as const,
    'ru-RU': () => 'Загрузить файл' as const,
  },

  // 文件列表分页栏没有更多
  filePagePaginationBarNoMoreText: {
    'en-US': () => 'No more...' as const,
    'zh-CN': () => '没有更多了...' as const,
    'zh-TW': () => '沒有更多了...' as const,
    'ja-JP': () => 'これ以上ありません...' as const,
    'ko-KR': () => '더 이상 없습니다...' as const,
    'ru-RU': () => 'Больше нет...' as const,
  },

  // 文件查询刷新
  filePageFileQueryRefreshText: {
    'en-US': () => 'Refresh' as const,
    'zh-CN': () => '刷新' as const,
    'zh-TW': () => '重新整理' as const,
    'ja-JP': () => '更新' as const,
    'ko-KR': () => '새로고침' as const,
    'ru-RU': () => 'Обновить' as const,
  },

  // 请选择文件（可多选）提示
  filePageBottomBarSelectText: {
    'en-US': () => 'Please select file(s)' as const,
    'zh-CN': () => '请选择文件' as const,
    'zh-TW': () => '請選擇檔案' as const,
    'ja-JP': () => 'ファイルを選択してください' as const,
    'ko-KR': () => '파일을 선택하세요' as const,
    'ru-RU': () => 'Пожалуйста, выберите файл(ы)' as const,
  },

  // 文件详情查询刷新
  fileInfoPageFileQueryRefreshText: {
    'en-US': () => 'Refresh' as const,
    'zh-CN': () => '刷新' as const,
    'zh-TW': () => '重新整理' as const,
    'ja-JP': () => '更新' as const,
    'ko-KR': () => '새로고침' as const,
    'ru-RU': () => 'Обновить' as const,
  },

  // 文件链接复制
  fileInfoPageFileLinkCopyText: {
    'en-US': () => 'File link copied' as const,
    'zh-CN': () => '文件链接已复制' as const,
    'zh-TW': () => '檔案連結已複製' as const,
    'ja-JP': () => 'ファイルリンクをコピーしました' as const,
    'ko-KR': () => '파일 링크가 복사되었습니다' as const,
    'ru-RU': () => 'Ссылка на файл скопирована' as const,
  },

  fileInfoPageFileLinkCopyNotSupportedTitle: {
    'en-US': () => 'Browser not supported, please copy manually' as const,
    'zh-CN': () => '当前浏览器不支持，请手动复制' as const,
    'zh-TW': () => '目前瀏覽器不支援，請手動複製' as const,
    'ja-JP': () =>
      'ブラウザが対応していません。手動でコピーしてください' as const,
    'ko-KR': () => '브라우저가 지원되지 않습니다. 수동으로 복사하세요' as const,
    'ru-RU': () => 'Браузер не поддерживается, скопируйте вручную' as const,
  },

  // 确认要删除此文件吗？
  fileInfoPageDeleteConfirmText: {
    'en-US': () => 'Are you sure you want to delete this file?' as const,
    'zh-CN': () => '确认要删除此文件吗？' as const,
    'zh-TW': () => '確認要刪除此檔案嗎？' as const,
    'ja-JP': () => 'このファイルを削除してもよろしいですか？' as const,
    'ko-KR': () => '이 파일을 삭제하시겠습니까?' as const,
    'ru-RU': () => 'Вы уверены, что хотите удалить этот файл?' as const,
  },

  // 删除文件
  fileInfoPageDeleteFileTitle: {
    'en-US': () => 'Delete file' as const,
    'zh-CN': () => '删除文件' as const,
    'zh-TW': () => '刪除檔案' as const,
    'ja-JP': () => 'ファイルを削除' as const,
    'ko-KR': () => '파일 삭제' as const,
    'ru-RU': () => 'Удалить файл' as const,
  },

  // 删除失败
  fileInfoPageDeleteFailedText: {
    'en-US': () => 'Delete failed' as const,
    'zh-CN': () => '删除失败' as const,
    'zh-TW': () => '刪除失敗' as const,
    'ja-JP': () => '削除に失敗しました' as const,
    'ko-KR': () => '삭제 실패' as const,
    'ru-RU': () => 'Не удалось удалить' as const,
  },

  // 文件名（title）
  fileInfoPageFileNameTitle: {
    'en-US': () => 'File Name' as const,
    'zh-CN': () => '文件名' as const,
    'zh-TW': () => '檔案名稱' as const,
    'ja-JP': () => 'ファイル名' as const,
    'ko-KR': () => '파일 이름' as const,
    'ru-RU': () => 'Имя файла' as const,
  },

  // 描述（title）
  fileInfoPageDescriptionTitle: {
    'en-US': () => 'Description' as const,
    'zh-CN': () => '描述' as const,
    'zh-TW': () => '描述' as const,
    'ja-JP': () => '説明' as const,
    'ko-KR': () => '설명' as const,
    'ru-RU': () => 'Описание' as const,
  },

  // 关键词（title）
  fileInfoPageKeywordTitle: {
    'en-US': () => 'Keywords' as const,
    'zh-CN': () => '关键词' as const,
    'zh-TW': () => '關鍵詞' as const,
    'ja-JP': () => 'キーワード' as const,
    'ko-KR': () => '키워드' as const,
    'ru-RU': () => 'Ключевые слова' as const,
  },

  // 文件名称（placeholder）
  fileInfoPageFileNamePlaceholder: {
    'en-US': () => 'Enter file name' as const,
    'zh-CN': () => '请输入文件名' as const,
    'zh-TW': () => '請輸入檔案名稱' as const,
    'ja-JP': () => 'ファイル名を入力' as const,
    'ko-KR': () => '파일 이름을 입력하세요' as const,
    'ru-RU': () => 'Введите имя файла' as const,
  },

  // 文件描述（placeholder）
  fileInfoPageDescriptionPlaceholder: {
    'en-US': () => 'File description' as const,
    'zh-CN': () => '文件描述' as const,
    'zh-TW': () => '檔案描述' as const,
    'ja-JP': () => 'ファイルの説明' as const,
    'ko-KR': () => '파일 설명' as const,
    'ru-RU': () => 'Описание файла' as const,
  },

  // 用于文件搜索（placeholder）
  fileInfoPageKeywordPlaceholder: {
    'en-US': () => 'Used for file search' as const,
    'zh-CN': () => '用于文件搜索' as const,
    'zh-TW': () => '用於檔案搜尋' as const,
    'ja-JP': () => 'ファイル検索に使用' as const,
    'ko-KR': () => '파일 검색에 사용' as const,
    'ru-RU': () => 'Используется для поиска файлов' as const,
  },

  // 修改失败
  fileInfoPageUpdateFailedText: {
    'en-US': () => 'Update failed' as const,
    'zh-CN': () => '修改失败' as const,
    'zh-TW': () => '修改失敗' as const,
    'ja-JP': () => '更新に失敗しました' as const,
    'ko-KR': () => '수정 실패' as const,
    'ru-RU': () => 'Не удалось обновить' as const,
  },

  // 文件详情页中所使用此文件的消息列表的标题
  fileInfoPageMessageListTitle: {
    'en-US': () => 'Messages' as const,
    'zh-CN': () => '消息' as const,
    'zh-TW': () => '訊息' as const,
    'ja-JP': () => 'メッセージ' as const,
    'ko-KR': () => '메시지' as const,
    'ru-RU': () => 'Сообщения' as const,
  },

  // 文件内容卡片：下载按钮文本
  fileContentCardBarDownloadText: {
    'en-US': () => 'Download' as const,
    'zh-CN': () => '下载' as const,
    'zh-TW': () => '下載' as const,
    'ja-JP': () => 'ダウンロード' as const,
    'ko-KR': () => '다운로드' as const,
    'ru-RU': () => 'Скачать' as const,
  },

  // 文件内容卡片：打开按钮文本
  fileContentCardBarOpenText: {
    'en-US': () => 'Open' as const,
    'zh-CN': () => '打开' as const,
    'zh-TW': () => '開啟' as const,
    'ja-JP': () => '開く' as const,
    'ko-KR': () => '열기' as const,
    'ru-RU': () => 'Открыть' as const,
  },
} as const satisfies I18nMessagesSatisfiesType
