import type { I18nMessagesSatisfiesType } from '.'
/**
 * i18nMessages 图片相关部分
 */
export const i18nMessagesImagePart = {
  // 上传图片组件（点击后即可上传图片）显示的文字
  imagePageImageUploadText: {
    'en-US': () => 'Upload Image' as const,
    'zh-CN': () => '上传图片' as const,
    'zh-TW': () => '上傳圖片' as const,
    'ja-JP': () => '画像をアップロード' as const,
    'ko-KR': () => '이미지 업로드' as const,
    'ru-RU': () => 'Загрузить изображение' as const,
  },
  imagePageAllImageText: {
    'en-US': () => 'All Images' as const,
    'zh-CN': () => '全部图片' as const,
    'zh-TW': () => '全部圖片' as const,
    'ja-JP': () => 'すべての画像' as const,
    'ko-KR': () => '모든 이미지' as const,
    'ru-RU': () => 'Все изображения' as const,
  },
  imagePageMyImageText: {
    'en-US': () => 'My Images' as const,
    'zh-CN': () => '我的图片' as const,
    'zh-TW': () => '我的圖片' as const,
    'ja-JP': () => '自分の画像' as const,
    'ko-KR': () => '내 이미지' as const,
    'ru-RU': () => 'Мои изображения' as const,
  },
  imagePageSearchPlaceholderText: {
    'en-US': () => 'Search ALT, keywords, username' as const,
    'zh-CN': () => '搜索ALT、关键词、用户名' as const,
    'zh-TW': () => '搜尋ALT、關鍵詞、用戶名' as const,
    'ja-JP': () => 'ALT、キーワード、ユーザー名を検索' as const,
    'ko-KR': () => 'ALT, 키워드, 사용자명 검색' as const,
    'ru-RU': () => 'Поиск ALT, ключевых слов, имени пользователя' as const,
  },
  // 图片上传列表标题
  imagePageImageUploadListTitle: {
    'en-US': () => 'Upload Image' as const,
    'zh-CN': () => '上传图片' as const,
    'zh-TW': () => '上傳圖片' as const,
    'ja-JP': () => '画像をアップロード' as const,
    'ko-KR': () => '이미지 업로드' as const,
    'ru-RU': () => 'Загрузить изображение' as const,
  },
  // 图片列表分页栏没有更多
  imagePagePaginationBarNoMoreText: {
    'en-US': () => 'No more...' as const,
    'zh-CN': () => '没有更多了...' as const,
    'zh-TW': () => '沒有更多了...' as const,
    'ja-JP': () => 'これ以上ありません...' as const,
    'ko-KR': () => '더 이상 없습니다...' as const,
    'ru-RU': () => 'Больше нет...' as const,
  },
  // 图片查询刷新
  imagePageImageQueryRefreshText: {
    'en-US': () => 'Refresh' as const,
    'zh-CN': () => '刷新' as const,
    'zh-TW': () => '重新整理' as const,
    'ja-JP': () => '更新' as const,
    'ko-KR': () => '새로고침' as const,
    'ru-RU': () => 'Обновить' as const,
  },
  // 请选择图片（可多选）提示
  imagePageBottomBarSelectText: {
    'en-US': () => 'Please select image(s)' as const,
    'zh-CN': () => '请选择图片' as const, // 中文本身不区分单复数
    'zh-TW': () => '請選擇圖片' as const,
    'ja-JP': () => '画像を選択してください' as const, // 日语也不区分单复数
    'ko-KR': () => '이미지를 선택하세요' as const,
    'ru-RU': () => 'Пожалуйста, выберите изображение(я)' as const,
  },
  // 显示在图片左下角的ALT
  imageShowAltLableText: {
    'en-US': () => 'ALT' as const,
    'zh-CN': () => 'ALT' as const,
    'zh-TW': () => 'ALT' as const,
    'ja-JP': () => 'ALT' as const,
    'ko-KR': () => 'ALT' as const,
    'ru-RU': () => 'ALT' as const,
  },
  // 图片详情查询刷新
  imageInfoPageImageQueryRefreshText: {
    'en-US': () => 'Refresh' as const,
    'zh-CN': () => '刷新' as const,
    'zh-TW': () => '重新整理' as const,
    'ja-JP': () => '更新' as const,
    'ko-KR': () => '새로고침' as const,
    'ru-RU': () => 'Обновить' as const,
  },
  // 图片链接复制
  imageInfoPageImageLinkCopyText: {
    'en-US': () => 'Image link copied' as const,
    'zh-CN': () => '图片链接已复制' as const,
    'zh-TW': () => '圖片連結已複製' as const,
    'ja-JP': () => '画像リンクをコピーしました' as const,
    'ko-KR': () => '이미지 링크가 복사되었습니다' as const,
    'ru-RU': () => 'Ссылка на изображение скопирована' as const,
  },
  imageInfoPageImageLinkCopyNotSupportedTitle: {
    'en-US': () => 'Browser not supported, please copy manually' as const,
    'zh-CN': () => '当前浏览器不支持，请手动复制' as const,
    'zh-TW': () => '目前瀏覽器不支援，請手動複製' as const,
    'ja-JP': () =>
      'ブラウザが対応していません。手動でコピーしてください' as const,
    'ko-KR': () => '브라우저가 지원되지 않습니다. 수동으로 복사하세요' as const,
    'ru-RU': () => 'Браузер не поддерживается, скопируйте вручную' as const,
  },

  // 确认要删除此图片吗？
  imageInfoPageDeleteConfirmText: {
    'en-US': () => 'Are you sure you want to delete this image?' as const,
    'zh-CN': () => '确认要删除此图片吗？' as const,
    'zh-TW': () => '確認要刪除此圖片嗎？' as const,
    'ja-JP': () => 'この画像を削除してもよろしいですか？' as const,
    'ko-KR': () => '이 이미지를 삭제하시겠습니까?' as const,
    'ru-RU': () => 'Вы уверены, что хотите удалить это изображение?' as const,
  },

  // 删除图片
  imageInfoPageDeleteImageTitle: {
    'en-US': () => 'Delete image' as const,
    'zh-CN': () => '删除图片' as const,
    'zh-TW': () => '刪除圖片' as const,
    'ja-JP': () => '画像を削除' as const,
    'ko-KR': () => '이미지 삭제' as const,
    'ru-RU': () => 'Удалить изображение' as const,
  },

  // 删除失败
  imageInfoPageDeleteFailedText: {
    'en-US': () => 'Delete failed' as const,
    'zh-CN': () => '删除失败' as const,
    'zh-TW': () => '刪除失敗' as const,
    'ja-JP': () => '削除に失敗しました' as const,
    'ko-KR': () => '삭제 실패' as const,
    'ru-RU': () => 'Не удалось удалить' as const,
  },

  // 关键词（title）
  imageInfoPageKeywordTitle: {
    'en-US': () => 'Keywords' as const,
    'zh-CN': () => '关键词' as const,
    'zh-TW': () => '關鍵詞' as const,
    'ja-JP': () => 'キーワード' as const,
    'ko-KR': () => '키워드' as const,
    'ru-RU': () => 'Ключевые слова' as const,
  },

  // 用于图片搜索（placeholder）
  imageInfoPageKeywordPlaceholder: {
    'en-US': () => 'Used for image search' as const,
    'zh-CN': () => '用于图片搜索' as const,
    'zh-TW': () => '用於圖片搜尋' as const,
    'ja-JP': () => '画像検索に使用' as const,
    'ko-KR': () => '이미지 검색에 사용' as const,
    'ru-RU': () => 'Используется для поиска изображений' as const,
  },

  // ALT（title，所有语言都是 ALT）
  imageInfoPageAltTitle: {
    'en-US': () => 'ALT' as const,
    'zh-CN': () => 'ALT' as const,
    'zh-TW': () => 'ALT' as const,
    'ja-JP': () => 'ALT' as const,
    'ko-KR': () => 'ALT' as const,
    'ru-RU': () => 'ALT' as const,
  },

  // 图片描述（placeholder）
  imageInfoPageAltPlaceholder: {
    'en-US': () => 'Image description' as const,
    'zh-CN': () => '图片描述' as const,
    'zh-TW': () => '圖片描述' as const,
    'ja-JP': () => '画像の説明' as const,
    'ko-KR': () => '이미지 설명' as const,
    'ru-RU': () => 'Описание изображения' as const,
  },

  // 修改失败
  imageInfoPageUpdateFailedText: {
    'en-US': () => 'Update failed' as const,
    'zh-CN': () => '修改失败' as const,
    'zh-TW': () => '修改失敗' as const,
    'ja-JP': () => '更新に失敗しました' as const,
    'ko-KR': () => '수정 실패' as const,
    'ru-RU': () => 'Не удалось обновить' as const,
  },

  // 图片详情页中所使用此图片的消息列表的标题
  imageInfoPageMessageListTitle: {
    'en-US': () => 'Messages' as const,
    'zh-CN': () => '消息' as const,
    'zh-TW': () => '訊息' as const,
    'ja-JP': () => 'メッセージ' as const,
    'ko-KR': () => '메시지' as const,
    'ru-RU': () => 'Сообщения' as const,
  },
} as const satisfies I18nMessagesSatisfiesType
