<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const questions = ref([])
const filteredQuestions = ref([])
const metadata = ref({})
const currentQuestionIndex = ref(0)
const selectedAnswer = ref('')
const answers = ref({})
const isQuizComplete = ref(false)
const showMetadata = ref(false)
const selectedPart = ref('')
const selectedSection = ref('')
const selectedTopic = ref('')
const showFilters = ref(false)
const questionHighlights = ref({})
const optionHighlights = ref({})
const showHighlightToolbar = ref(false)
const selectedText = ref('')
const highlightColor = ref('yellow')
const highlightType = ref('question') // 'question' 或 'option'
const userNotes = ref({})
const currentNote = ref('')
const noteHasChanges = ref(false)
const translations = ref({})
const currentTranslation = ref('')
const translationHasChanges = ref(false)
const showTranslation = ref(false)
const serverStatus = ref('checking') // 'checking', 'online', 'offline'
const serverError = ref('')

// 计算属性
const currentQuestion = computed(() => filteredQuestions.value[currentQuestionIndex.value])
const progress = computed(() => {
  if (filteredQuestions.value.length === 0) return 0
  return ((currentQuestionIndex.value + 1) / filteredQuestions.value.length) * 100
})
const canGoNext = computed(() => currentQuestionIndex.value < filteredQuestions.value.length - 1)
const canGoPrevious = computed(() => currentQuestionIndex.value > 0)

// 分类选项
const availableParts = computed(() => {
  const parts = [...new Set(questions.value.map(q => q.source_part).filter(Boolean))]
  return parts.sort()
})

const availableSections = computed(() => {
  const sections = [...new Set(questions.value
    .filter(q => !selectedPart.value || q.source_part === selectedPart.value)
    .map(q => q.source_section)
    .filter(Boolean))]
  return sections.sort()
})

const availableTopics = computed(() => {
  const topics = [...new Set(questions.value
    .filter(q => {
      const partMatch = !selectedPart.value || q.source_part === selectedPart.value
      const sectionMatch = !selectedSection.value || q.source_section === selectedSection.value
      return partMatch && sectionMatch
    })
    .map(q => q.topic)
    .filter(Boolean))]
  return topics.sort()
})

const filteredQuestionsCount = computed(() => filteredQuestions.value.length)

// 高亮文本计算属性
const highlightedQuestionText = computed(() => {
  if (!currentQuestion.value) return ''
  return getHighlightedText(currentQuestion.value.question_text, 'question')
})

const highlightedOptions = computed(() => {
  if (!currentQuestion.value?.options) return {}
  const highlighted = {}
  Object.keys(currentQuestion.value.options).forEach(key => {
    highlighted[key] = getHighlightedText(currentQuestion.value.options[key], 'option')
  })
  return highlighted
})

// 方法
const loadQuestions = async () => {
  try {
    console.log('开始加载题目数据...')
    const response = await fetch('/db/all_questions.json')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    console.log('数据请求成功，开始解析JSON...')
    const data = await response.json()
    console.log('JSON解析成功，数据:', data)
    
    questions.value = data.questions || []
    metadata.value = data.metadata || {}
    // 初始化时显示所有题目
    filteredQuestions.value = questions.value
    
    console.log(`成功加载 ${questions.value.length} 道题目`)
    
    // 加载保存的数据
    await loadHighlights()
    await loadAnswers()
    await loadNotes()
    await loadTranslations()
    
    // 加载当前题目的笔记和翻译
    setTimeout(() => {
      loadCurrentNote()
      loadCurrentTranslation()
      
      // 调试：检查当前题目的数据
      const currentQ = currentQuestion.value
      if (currentQ) {
        console.log('🔍 当前题目数据检查:', {
          questionId: currentQ.question_id,
          hasNote: !!userNotes.value[currentQ.question_id],
          hasTranslation: !!translations.value[currentQ.question_id],
          hasQuestionHighlights: !!questionHighlights.value[currentQ.question_id],
          hasOptionHighlights: !!optionHighlights.value[currentQ.question_id],
          noteContent: userNotes.value[currentQ.question_id],
          translationContent: translations.value[currentQ.question_id]
        })
      }
    }, 100)
  } catch (error) {
    console.error('加载题目失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      url: '/db/all_questions.json'
    })
  }
}

// 服务器API调用
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:3001/api' 
  : '/api'

// 检查服务器状态
const checkServerStatus = async () => {
  try {
    serverStatus.value = 'checking'
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      timeout: 5000
    })
    
    if (response.ok) {
      serverStatus.value = 'online'
      serverError.value = ''
      console.log('✅ 后端服务器连接正常')
    } else {
      serverStatus.value = 'offline'
      serverError.value = `服务器响应错误: ${response.status}`
      console.error('❌ 后端服务器响应错误:', response.status)
    }
  } catch (error) {
    serverStatus.value = 'offline'
    serverError.value = error.message
    console.error('❌ 后端服务器连接失败:', error.message)
  }
}

// 服务器API调用方法
const saveToServer = async (data) => {
  try {
    const response = await fetch(`${API_BASE}/save-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'default_user',
        data: data
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('数据保存到服务器成功:', result)
    return true
  } catch (error) {
    console.error('保存到服务器失败:', error)
    return false
  }
}

const loadFromServer = async () => {
  try {
    console.log('🔄 开始从服务器加载数据...')
    const response = await fetch(`${API_BASE}/get-data/default_user`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('✅ 从服务器加载数据成功:', {
      userId: result.data?.userId,
      lastUpdated: result.data?.lastUpdated,
      answersCount: Object.keys(result.data?.answers || {}).length,
      notesCount: Object.keys(result.data?.notes || {}).length,
      translationsCount: Object.keys(result.data?.translations || {}).length,
      questionHighlightsCount: Object.keys(result.data?.questionHighlights || {}).length,
      optionHighlightsCount: Object.keys(result.data?.optionHighlights || {}).length
    })
    return result.data
  } catch (error) {
    console.error('❌ 从服务器加载失败:', error)
    return null
  }
}

// 统一保存所有数据的方法
const saveAllData = async () => {
  const data = {
    answers: answers.value,
    notes: userNotes.value,
    translations: translations.value,
    questionHighlights: questionHighlights.value,
    optionHighlights: optionHighlights.value
  }
  
  console.log('🔄 开始保存数据到服务器...', {
    answersCount: Object.keys(data.answers).length,
    notesCount: Object.keys(data.notes).length,
    translationsCount: Object.keys(data.translations).length,
    questionHighlightsCount: Object.keys(data.questionHighlights).length,
    optionHighlightsCount: Object.keys(data.optionHighlights).length
  })
  
  const serverSaved = await saveToServer(data)
  if (serverSaved) {
    console.log('✅ 数据已保存到服务器')
  } else {
    console.log('⚠️ 服务器保存失败，回退到localStorage')
    // 回退到localStorage
    localStorage.setItem('quiz-answers', JSON.stringify(answers.value))
    localStorage.setItem('quiz-notes', JSON.stringify(userNotes.value))
    localStorage.setItem('quiz-translations', JSON.stringify(translations.value))
    localStorage.setItem('quiz-question-highlights', JSON.stringify(questionHighlights.value))
    localStorage.setItem('quiz-option-highlights', JSON.stringify(optionHighlights.value))
    console.log('✅ 数据已保存到localStorage')
  }
}

// 数据持久化功能
const saveHighlights = async () => {
  await saveAllData()
}

const loadHighlights = async () => {
  const serverData = await loadFromServer()
  if (serverData) {
    questionHighlights.value = serverData.questionHighlights || {}
    optionHighlights.value = serverData.optionHighlights || {}
  } else {
    // 回退到localStorage
    const savedQuestion = localStorage.getItem('quiz-question-highlights')
    const savedOption = localStorage.getItem('quiz-option-highlights')
    
    if (savedQuestion) {
      try {
        questionHighlights.value = JSON.parse(savedQuestion)
      } catch (error) {
        console.error('加载题目高亮数据失败:', error)
        questionHighlights.value = {}
      }
    }
    
    if (savedOption) {
      try {
        optionHighlights.value = JSON.parse(savedOption)
      } catch (error) {
        console.error('加载选项高亮数据失败:', error)
        optionHighlights.value = {}
      }
    }
  }
}

const saveAnswers = async () => {
  await saveAllData()
}

const loadAnswers = async () => {
  const serverData = await loadFromServer()
  if (serverData) {
    answers.value = serverData.answers || {}
    console.log('从服务器加载答案成功:', answers.value)
  } else {
    // 回退到localStorage
    const saved = localStorage.getItem('quiz-answers')
    console.log('从localStorage加载答案:', saved)
    if (saved) {
      try {
        answers.value = JSON.parse(saved)
        console.log('答案加载成功:', answers.value)
      } catch (error) {
        console.error('加载答案数据失败:', error)
        answers.value = {}
      }
    } else {
      console.log('没有找到保存的答案数据')
      answers.value = {}
    }
  }
}

const saveNotes = async () => {
  await saveAllData()
  console.log('笔记已保存:', userNotes.value)
}

const loadNotes = async () => {
  const serverData = await loadFromServer()
  if (serverData) {
    userNotes.value = serverData.notes || {}
    console.log('从服务器加载笔记成功:', userNotes.value)
  } else {
    // 回退到localStorage
    const saved = localStorage.getItem('quiz-notes')
    console.log('从localStorage加载笔记:', saved)
    if (saved) {
      try {
        userNotes.value = JSON.parse(saved)
        console.log('笔记加载成功:', userNotes.value)
      } catch (error) {
        console.error('加载笔记数据失败:', error)
        userNotes.value = {}
      }
    } else {
      console.log('没有找到保存的笔记数据')
      userNotes.value = {}
    }
  }
}

const saveTranslations = async () => {
  await saveAllData()
  console.log('翻译已保存:', translations.value)
}

const loadTranslations = async () => {
  const serverData = await loadFromServer()
  if (serverData) {
    translations.value = serverData.translations || {}
    console.log('从服务器加载翻译成功:', translations.value)
  } else {
    // 回退到localStorage
    const saved = localStorage.getItem('quiz-translations')
    console.log('从localStorage加载翻译:', saved)
    if (saved) {
      try {
        translations.value = JSON.parse(saved)
        console.log('翻译加载成功:', translations.value)
      } catch (error) {
        console.error('加载翻译数据失败:', error)
        translations.value = {}
      }
    } else {
      console.log('没有找到保存的翻译数据')
      translations.value = {}
    }
  }
}

const applyFilters = () => {
  let filtered = questions.value
  
  if (selectedPart.value) {
    filtered = filtered.filter(q => q.source_part === selectedPart.value)
  }
  
  if (selectedSection.value) {
    filtered = filtered.filter(q => q.source_section === selectedSection.value)
  }
  
  if (selectedTopic.value) {
    filtered = filtered.filter(q => q.topic === selectedTopic.value)
  }
  
  filteredQuestions.value = filtered
  currentQuestionIndex.value = 0
  selectedAnswer.value = answers.value[currentQuestion.value?.question_id] || ''
  
  // 调试信息
  console.log('筛选后的题目数量:', filtered.length)
  console.log('筛选后的题目索引范围:', filtered.map((q, i) => `${i + 1}: ${q.question_id}`).slice(0, 10))
}

const clearFilters = () => {
  selectedPart.value = ''
  selectedSection.value = ''
  selectedTopic.value = ''
  filteredQuestions.value = questions.value
  currentQuestionIndex.value = 0
  selectedAnswer.value = answers.value[currentQuestion.value?.question_id] || ''
}

const onPartChange = () => {
  selectedSection.value = ''
  selectedTopic.value = ''
  applyFilters()
}

const onSectionChange = () => {
  selectedTopic.value = ''
  applyFilters()
}

const resetQuiz = () => {
  currentQuestionIndex.value = 0
  selectedAnswer.value = ''
  answers.value = {}
  isQuizComplete.value = false
}

const selectAnswer = (option) => {
  selectedAnswer.value = option
  answers.value[currentQuestion.value.question_id] = option
  saveAnswers()
}

const nextQuestion = () => {
  if (canGoNext.value) {
    // 自动保存当前笔记和翻译
    if (noteHasChanges.value) {
      saveNote()
    }
    if (translationHasChanges.value) {
      saveTranslation()
    }
    currentQuestionIndex.value++
    selectedAnswer.value = answers.value[currentQuestion.value?.question_id] || ''
    loadCurrentNote()
    loadCurrentTranslation()
  }
}

const previousQuestion = () => {
  if (canGoPrevious.value) {
    // 自动保存当前笔记和翻译
    if (noteHasChanges.value) {
      saveNote()
    }
    if (translationHasChanges.value) {
      saveTranslation()
    }
    currentQuestionIndex.value--
    selectedAnswer.value = answers.value[currentQuestion.value?.question_id] || ''
    loadCurrentNote()
    loadCurrentTranslation()
  }
}

const goToQuestion = (index) => {
  // 自动保存当前笔记和翻译
  if (noteHasChanges.value) {
    saveNote()
  }
  if (translationHasChanges.value) {
    saveTranslation()
  }
  currentQuestionIndex.value = index
  selectedAnswer.value = answers.value[currentQuestion.value?.question_id] || ''
  loadCurrentNote()
  loadCurrentTranslation()
}

const submitQuiz = () => {
  isQuizComplete.value = true
}

// 高亮相关方法
const handleTextSelection = (event) => {
  const selection = window.getSelection()
  const text = selection.toString().trim()
  
  if (text.length > 0) {
    selectedText.value = text
    // 判断是题目还是选项
    if (event.target.closest('.question-text')) {
      highlightType.value = 'question'
    } else if (event.target.closest('.option-text')) {
      highlightType.value = 'option'
    }
    showHighlightToolbar.value = true
  } else {
    showHighlightToolbar.value = false
  }
}

const addHighlight = async (color) => {
  if (!selectedText.value) return
  
  const questionId = currentQuestion.value?.question_id
  if (!questionId) return
  
  const highlight = {
    id: Date.now(),
    text: selectedText.value,
    color: color,
    timestamp: new Date().toISOString()
  }
  
  if (highlightType.value === 'question') {
    if (!questionHighlights.value[questionId]) {
      questionHighlights.value[questionId] = []
    }
    questionHighlights.value[questionId].push(highlight)
    console.log('添加题目高亮:', highlight)
  } else if (highlightType.value === 'option') {
    if (!optionHighlights.value[questionId]) {
      optionHighlights.value[questionId] = []
    }
    optionHighlights.value[questionId].push(highlight)
    console.log('添加选项高亮:', highlight)
  }
  
  // 保存数据（会尝试服务器，失败则回退到localStorage）
  await saveHighlights()
  
  // 清除选择
  window.getSelection().removeAllRanges()
  showHighlightToolbar.value = false
  selectedText.value = ''
}

const removeHighlight = async (questionId, highlightId, type) => {
  if (type === 'question' && questionHighlights.value[questionId]) {
    questionHighlights.value[questionId] = questionHighlights.value[questionId].filter(h => h.id !== highlightId)
  } else if (type === 'option' && optionHighlights.value[questionId]) {
    optionHighlights.value[questionId] = optionHighlights.value[questionId].filter(h => h.id !== highlightId)
  }
  await saveHighlights()
}

const getHighlightedText = (text, type) => {
  const questionId = currentQuestion.value?.question_id
  if (!questionId) return text
  
  const highlights = type === 'question' ? questionHighlights.value : optionHighlights.value
  if (!highlights[questionId] || highlights[questionId].length === 0) {
    return text
  }
  
  let highlightedText = text
  // 按添加时间倒序排列，后添加的高亮优先
  const sortedHighlights = [...highlights[questionId]].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  
  sortedHighlights.forEach(highlight => {
    const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedText})`, 'gi')
    highlightedText = highlightedText.replace(regex, `<mark class="highlight-${highlight.color}" data-highlight-id="${highlight.id}" data-highlight-type="${type}" style="background-color: ${getColorValue(highlight.color)}; color: ${getTextColor(highlight.color)}; padding: 2px 4px; border-radius: 3px;">$1</mark>`)
  })
  
  return highlightedText
}

const getColorValue = (color) => {
  const colorMap = {
    'yellow': '#ffeb3b',
    'green': '#4caf50',
    'blue': '#2196f3',
    'pink': '#e91e63',
    'orange': '#ff9800'
  }
  return colorMap[color] || '#ffeb3b'
}

const getTextColor = (color) => {
  const textColorMap = {
    'yellow': '#000',
    'green': '#fff',
    'blue': '#fff',
    'pink': '#fff',
    'orange': '#fff'
  }
  return textColorMap[color] || '#000'
}

const clearAllHighlights = async (type) => {
  const questionId = currentQuestion.value?.question_id
  if (!questionId) return
  
  if (type === 'question' && questionHighlights.value[questionId]) {
    questionHighlights.value[questionId] = []
  } else if (type === 'option' && optionHighlights.value[questionId]) {
    optionHighlights.value[questionId] = []
  }
  await saveHighlights()
}

// 笔记相关方法
const updateNote = () => {
  noteHasChanges.value = true
}

const saveNote = async () => {
  const questionId = currentQuestion.value?.question_id
  if (!questionId) return
  
  userNotes.value[questionId] = currentNote.value
  await saveNotes()
  noteHasChanges.value = false
  console.log('笔记已保存:', { questionId, note: currentNote.value })
}

const clearNote = () => {
  const questionId = currentQuestion.value?.question_id
  if (!questionId) return
  
  userNotes.value[questionId] = ''
  currentNote.value = ''
  noteHasChanges.value = false
  saveNotes()
  console.log('笔记已清除:', questionId)
}

const loadCurrentNote = () => {
  const questionId = currentQuestion.value?.question_id
  console.log('加载当前题目笔记:', { questionId, userNotes: userNotes.value })
  if (questionId && userNotes.value[questionId]) {
    currentNote.value = userNotes.value[questionId]
    console.log('加载到笔记内容:', currentNote.value)
  } else {
    currentNote.value = ''
    console.log('没有找到该题目的笔记')
  }
  noteHasChanges.value = false
}

// 翻译相关方法
const updateTranslation = () => {
  translationHasChanges.value = true
}

const saveTranslation = async () => {
  const questionId = currentQuestion.value?.question_id
  if (!questionId) return
  
  translations.value[questionId] = currentTranslation.value
  await saveTranslations()
  translationHasChanges.value = false
  console.log('翻译已保存:', { questionId, translation: currentTranslation.value })
}

const clearTranslation = () => {
  const questionId = currentQuestion.value?.question_id
  if (!questionId) return
  
  translations.value[questionId] = ''
  currentTranslation.value = ''
  translationHasChanges.value = false
  saveTranslations()
  console.log('翻译已清除:', questionId)
}

const loadCurrentTranslation = () => {
  const questionId = currentQuestion.value?.question_id
  console.log('加载当前题目翻译:', { questionId, translations: translations.value })
  if (questionId && translations.value[questionId]) {
    currentTranslation.value = translations.value[questionId]
    console.log('加载到翻译内容:', currentTranslation.value)
  } else {
    currentTranslation.value = ''
    console.log('没有找到该题目的翻译')
  }
  translationHasChanges.value = false
}

// 生命周期
onMounted(async () => {
  // 首先检查服务器状态
  await checkServerStatus()
  
  // 然后加载题目
  await loadQuestions()
  
  // 页面离开时自动保存笔记和翻译
  window.addEventListener('beforeunload', () => {
    if (noteHasChanges.value) {
      saveNote()
    }
    if (translationHasChanges.value) {
      saveTranslation()
    }
  })
  
  // 定期检查服务器状态（每30秒）
  setInterval(checkServerStatus, 30000)
})
</script>

<template>
  <div class="quiz-container">
    <!-- 头部 -->
    <header class="quiz-header">
      <div class="header-controls">
        <div class="filter-controls">
          <button class="filter-toggle-btn" @click="showFilters = !showFilters">
            {{ showFilters ? 'Hide' : 'Show' }} Filters
          </button>
          <span class="filter-status" v-if="selectedPart || selectedSection || selectedTopic">
            Filtered: {{ filteredQuestionsCount }} questions
          </span>
        </div>
        <div class="translation-controls">
          <button class="translation-toggle-btn" @click="showTranslation = !showTranslation">
            {{ showTranslation ? 'Hide' : 'Show' }} Analysis
          </button>
          <span class="translation-status" v-if="currentTranslation">
            Analyzed
          </span>
        </div>
        <div class="server-status">
          <span 
            class="status-indicator" 
            :class="{
              'status-checking': serverStatus === 'checking',
              'status-online': serverStatus === 'online',
              'status-offline': serverStatus === 'offline'
            }"
            :title="serverError || '服务器状态'"
          >
            {{ serverStatus === 'checking' ? '🔄' : serverStatus === 'online' ? '✅' : '❌' }}
            {{ serverStatus === 'checking' ? 'Checking' : serverStatus === 'online' ? 'Server Online' : 'Server Offline' }}
          </span>
        </div>
      </div>
    </header>


    <!-- 分类筛选面板 -->
    <div class="filter-panel" v-if="showFilters">
      <h3>Question Filter</h3>
      <div class="filter-options">
        <div class="filter-group">
          <label for="part-select">Exam Part:</label>
          <select id="part-select" v-model="selectedPart" @change="onPartChange">
            <option value="">All Parts</option>
            <option v-for="part in availableParts" :key="part" :value="part">
              {{ part }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="section-select">Section:</label>
          <select id="section-select" v-model="selectedSection" @change="onSectionChange" :disabled="!selectedPart">
            <option value="">All Sections</option>
            <option v-for="section in availableSections" :key="section" :value="section">
              {{ section }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="topic-select">Topic:</label>
          <select id="topic-select" v-model="selectedTopic" @change="applyFilters" :disabled="!selectedPart || !selectedSection">
            <option value="">All Topics</option>
            <option v-for="topic in availableTopics" :key="topic" :value="topic">
              {{ topic }}
            </option>
          </select>
        </div>
        
        <div class="filter-actions">
          <button class="apply-filter-btn" @click="applyFilters">Apply Filter</button>
          <button class="clear-filter-btn" @click="clearFilters">Clear Filter</button>
        </div>
      </div>
      
      <div class="filter-stats">
        <p>Total Questions: {{ questions.length }}</p>
        <p>Filtered Questions: {{ filteredQuestionsCount }}</p>
        <p v-if="selectedPart">Current Part: {{ selectedPart }}</p>
        <p v-if="selectedSection">Current Section: {{ selectedSection }}</p>
        <p v-if="selectedTopic">Current Topic: {{ selectedTopic }}</p>
        <div class="filter-level-indicator">
          <span class="level-badge" :class="{ active: selectedPart }">Part</span>
          <span class="level-arrow">→</span>
          <span class="level-badge" :class="{ active: selectedSection }">Section</span>
          <span class="level-arrow">→</span>
          <span class="level-badge" :class="{ active: selectedTopic }">Topic</span>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-container" v-if="!isQuizComplete && questions.length > 0">
      <!-- 左侧题目导航 -->
      <aside class="question-nav-sidebar">
        <div class="nav-header">
          <h3>Question Navigation</h3>
          <span class="nav-count">{{ filteredQuestionsCount }} questions</span>
        </div>
        <div class="question-list">
          <button 
            v-for="(question, index) in filteredQuestions.slice(0, 100)" 
            :key="`${question.question_id}-${index}`"
            class="question-nav-btn"
            :class="{ 
              'current': index === currentQuestionIndex,
              'answered': answers[question.question_id]
            }"
            @click="goToQuestion(index)"
          >
            {{ index + 1 }}
          </button>
          <div v-if="filteredQuestionsCount > 100" class="nav-more">
            <span>{{ filteredQuestionsCount - 100 }} more questions...</span>
          </div>
        </div>
      </aside>

      <!-- 中间主要内容 -->
      <main class="quiz-main">
        <!-- 题目信息 -->
        <div class="question-header">
          <div class="question-meta">
            <span class="question-number">Question {{ currentQuestion.question_number }}</span>
            <span class="question-topic">{{ currentQuestion.topic }}</span>
            <span class="question-part" v-if="currentQuestion.source_part">{{ currentQuestion.source_part }}</span>
          </div>
          <div class="question-details">
            <div class="question-id">ID: {{ currentQuestion.question_id }}</div>
            <div class="question-section" v-if="currentQuestion.source_section">{{ currentQuestion.source_section }}</div>
          </div>
        </div>

        <!-- 题目内容 -->
        <div class="question-content">
          <div class="question-text-container">
            <h2 
              class="question-text" 
              @mouseup="handleTextSelection"
              v-html="highlightedQuestionText"
            ></h2>
            
            <!-- 高亮工具栏 -->
            <div class="highlight-toolbar" v-if="showHighlightToolbar">
              <div class="toolbar-content">
                <span class="selected-text">
                  {{ highlightType === 'question' ? 'Question' : 'Option' }} Highlight: "{{ selectedText }}"
                </span>
                <div class="color-options">
                  <button 
                    v-for="color in ['yellow', 'green', 'blue', 'pink', 'orange']" 
                    :key="color"
                    class="color-btn"
                    :class="`color-${color}`"
                    @click="addHighlight(color)"
                    :title="`Mark as ${color}`"
                  ></button>
                </div>
                <button class="cancel-highlight" @click="showHighlightToolbar = false">Cancel</button>
              </div>
            </div>
          </div>
          
          <!-- 选项 -->
          <div class="options-container">
            <div 
              v-for="(option, key) in currentQuestion.options" 
              :key="key"
              class="option-item"
              :class="{ 'selected': selectedAnswer === key }"
              @click="selectAnswer(key)"
            >
              <span class="option-label">{{ key }}</span>
              <span 
                class="option-text" 
                @mouseup="handleTextSelection"
                v-html="highlightedOptions[key]"
              ></span>
            </div>
          </div>
          
          <!-- 题目高亮管理 -->
          <div class="highlight-management" v-if="questionHighlights[currentQuestion?.question_id]?.length > 0">
            <div class="highlight-header">
              <h4>Question Highlights</h4>
              <button class="clear-highlights-btn" @click="clearAllHighlights('question')">Clear Question Highlights</button>
            </div>
            <div class="highlight-list">
              <div 
                v-for="highlight in questionHighlights[currentQuestion.question_id]" 
                :key="highlight.id"
                class="highlight-item"
              >
                <span class="highlight-color" :class="`color-${highlight.color}`"></span>
                <span class="highlight-text">{{ highlight.text }}</span>
                <button 
                  class="remove-highlight-btn" 
                  @click="removeHighlight(currentQuestion.question_id, highlight.id, 'question')"
                >×</button>
              </div>
            </div>
          </div>
          
          <!-- 选项高亮管理 -->
          <div class="highlight-management" v-if="optionHighlights[currentQuestion?.question_id]?.length > 0">
            <div class="highlight-header">
              <h4>Option Highlights</h4>
              <button class="clear-highlights-btn" @click="clearAllHighlights('option')">Clear Option Highlights</button>
            </div>
            <div class="highlight-list">
              <div 
                v-for="highlight in optionHighlights[currentQuestion.question_id]" 
                :key="highlight.id"
                class="highlight-item"
              >
                <span class="highlight-color" :class="`color-${highlight.color}`"></span>
                <span class="highlight-text">{{ highlight.text }}</span>
                <button 
                  class="remove-highlight-btn" 
                  @click="removeHighlight(currentQuestion.question_id, highlight.id, 'option')"
                >×</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 用户笔记区域 -->
        <div class="notes-section">
          <div class="notes-header">
            <h4>Study Notes</h4>
            <div class="notes-actions">
              <button 
                class="save-note-btn" 
                @click="saveNote" 
                :disabled="!noteHasChanges"
                :class="{ 'has-changes': noteHasChanges }"
              >
                {{ noteHasChanges ? 'Save Notes' : 'Saved' }}
              </button>
              <button class="clear-note-btn" @click="clearNote" v-if="currentNote">Clear Notes</button>
              <span class="note-count" v-if="currentNote">{{ currentNote.length }} characters</span>
            </div>
          </div>
          <div class="notes-input-container">
            <textarea
              v-model="currentNote"
              @input="updateNote"
              placeholder="Record your study notes, thought process, or important reminders here..."
              class="notes-textarea"
              rows="6"
            ></textarea>
          </div>
          <div class="notes-tips">
            <small>💡 Tip: Click "Save Notes" after editing. Each question maintains independent notes when switching.</small>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="navigation">
          <button 
            class="nav-btn prev-btn" 
            @click="previousQuestion"
            :disabled="!canGoPrevious"
          >
            Previous
          </button>
          
          <button 
            class="nav-btn next-btn" 
            @click="nextQuestion"
            :disabled="!canGoNext"
          >
            Next
          </button>
        </div>
      </main>

    </div>

    <!-- 完成页面 -->
    <div class="completion-page" v-if="isQuizComplete">
      <h2>Quiz Completed!</h2>
      <div class="completion-stats">
        <p>Filtered Questions: {{ filteredQuestionsCount }}</p>
        <p>Answered Questions: {{ Object.keys(answers).length }}</p>
        <p>Completion Rate: {{ Math.round((Object.keys(answers).length / filteredQuestionsCount) * 100) }}%</p>
        <p v-if="selectedPart">Exam Part: {{ selectedPart }}</p>
        <p v-if="selectedSection">Section: {{ selectedSection }}</p>
        <p v-if="selectedTopic">Topic: {{ selectedTopic }}</p>
      </div>
      <button class="reset-btn" @click="resetQuiz">Start Over</button>
    </div>

    <!-- 加载状态 -->
    <div class="loading" v-if="questions.length === 0">
      <p>Loading questions...</p>
    </div>

    <!-- 翻译弹窗 -->
    <div class="translation-modal" v-if="showTranslation" @click.self="showTranslation = false">
      <div class="translation-modal-content">
        <div class="translation-modal-header">
          <h3>Question Analysis</h3>
          <button class="close-btn" @click="showTranslation = false">×</button>
        </div>
        <div class="translation-modal-body">
          <div class="translation-actions">
            <button 
              class="save-translation-btn" 
              @click="saveTranslation" 
              :disabled="!translationHasChanges"
              :class="{ 'has-changes': translationHasChanges }"
            >
              {{ translationHasChanges ? 'Save Analysis' : 'Saved' }}
            </button>
            <button class="clear-translation-btn" @click="clearTranslation" v-if="currentTranslation">Clear Analysis</button>
            <span class="translation-count" v-if="currentTranslation">{{ currentTranslation.length }} characters</span>
          </div>
          <div class="translation-section">
            <h4>Question Analysis</h4>
            <textarea
              v-model="currentTranslation"
              @input="updateTranslation"
              placeholder="Enter your analysis of the question here..."
              class="translation-textarea"
              rows="12"
            ></textarea>
          </div>
          <div class="translation-tips">
            <small>💡 Tip: Analysis is auto-saved. Each question maintains independent analysis when switching.</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-sizing: border-box;
  overflow: hidden;
}

.quiz-header {
  background: white;
  padding: 8px 15px;
  margin: 5px;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.filter-controls, .translation-controls, .server-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-toggle-btn, .translation-toggle-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-toggle-btn:hover, .translation-toggle-btn:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.filter-status, .translation-status {
  background: #e9ecef;
  color: #6c757d;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 500;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 500;
  cursor: help;
  transition: all 0.3s ease;
}

.status-checking {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-online {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-offline {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.quiz-header h1 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 1.5em;
  font-weight: 600;
}

.metadata-info {
  margin-bottom: 10px;
  text-align: center;
}

.total-questions {
  font-size: 1.2em;
  color: #667eea;
  font-weight: 600;
  margin: 10px 0;
}

.description {
  color: #666;
  margin: 10px 0;
  font-style: italic;
}

.toggle-metadata-btn {
  background: #f8f9fa;
  border: 2px solid #667eea;
  color: #667eea;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.toggle-metadata-btn:hover {
  background: #667eea;
  color: white;
}

.metadata-details {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.metadata-details h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.parts-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.part-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.part-item strong {
  color: #667eea;
  display: block;
  margin-bottom: 5px;
}

.issues-summary {
  background: #fff3cd;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.issues-summary h4 {
  color: #856404;
  margin-bottom: 15px;
}

.issues-summary p {
  margin: 5px 0;
  color: #856404;
}

.filter-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 15px;
}

.filter-toggle-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.filter-toggle-btn:hover {
  background: #218838;
  transform: translateY(-2px);
}

.filter-status {
  color: #28a745;
  font-weight: 600;
  font-size: 1.1em;
}

.filter-panel {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.filter-panel h3 {
  color: #333;
  margin-bottom: 25px;
  font-size: 1.5em;
  text-align: center;
}

.filter-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #333;
  font-size: 1.1em;
}

.filter-group select {
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1em;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-group select:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.filter-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: end;
}

.apply-filter-btn, .clear-filter-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-filter-btn {
  background: #667eea;
  color: white;
}

.apply-filter-btn:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.clear-filter-btn {
  background: #6c757d;
  color: white;
}

.clear-filter-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.filter-stats {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.filter-stats p {
  margin: 8px 0;
  color: #495057;
  font-weight: 500;
}

.filter-level-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.level-badge {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9em;
  font-weight: 600;
  background: #e9ecef;
  color: #6c757d;
  transition: all 0.3s ease;
}

.level-badge.active {
  background: #667eea;
  color: white;
  transform: scale(1.05);
}

.level-arrow {
  color: #6c757d;
  font-weight: bold;
  font-size: 1.2em;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: center;
}

.progress-bar {
  flex: 1;
  max-width: 400px;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: #666;
  font-size: 1.1em;
}

.main-container {
  display: flex;
  height: calc(100vh - 30px);
  gap: 10px;
  padding: 0 10px 10px 10px;
  box-sizing: border-box;
}

.question-nav-sidebar {
  width: 100px;
  background: white;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  flex-shrink: 0;
}

.nav-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.nav-header h3 {
  margin: 0;
  color: #333;
  font-size: 0.8em;
  text-align: center;
  font-weight: 600;
}

.nav-count {
  background: #667eea;
  color: white;
  padding: 1px 4px;
  border-radius: 8px;
  font-size: 0.6em;
  text-align: center;
  margin-top: 3px;
  font-weight: 500;
}

.question-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin-top: 8px;
}

.question-nav-btn {
  width: 100%;
  height: 28px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75em;
}

.question-nav-btn:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.question-nav-btn.current {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.question-nav-btn.answered {
  border-color: #28a745;
  background: #28a745;
  color: white;
}

.nav-more {
  text-align: center;
  padding: 4px;
  color: #6c757d;
  font-size: 0.6em;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 4px;
  margin-top: 6px;
}

.quiz-main {
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  min-width: 0;
}

/* 翻译弹窗样式 */
.translation-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.translation-modal-content {
  background: white;
  border-radius: 15px;
  width: 95%;
  max-width: 1000px;
  max-height: 90vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.translation-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #f0f0f0;
  background: #f8f9fa;
}

.translation-modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3em;
  font-weight: 600;
}

.close-btn {
  background: #dc3545;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2em;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

.translation-modal-body {
  padding: 25px;
  overflow-y: auto;
  flex: 1;
}

.translation-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.translation-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3em;
  font-weight: 600;
  text-align: center;
}

.translation-actions {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.save-translation-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
}

.save-translation-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.save-translation-btn.has-changes {
  background: #17a2b8;
  color: white;
  cursor: pointer;
}

.save-translation-btn.has-changes:hover {
  background: #138496;
  transform: translateY(-1px);
}

.clear-translation-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
}

.clear-translation-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.translation-count {
  color: #6c757d;
  font-size: 0.9em;
  font-weight: 500;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  text-align: center;
}

.translation-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.translation-section h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.1em;
  font-weight: 600;
}

.translation-textarea {
  width: 100%;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1em;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
  min-height: 400px;
  transition: border-color 0.3s ease;
  background: white;
}

.translation-textarea:focus {
  outline: none;
  border-color: #17a2b8;
  box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.1);
}

.translation-textarea::placeholder {
  color: #6c757d;
  font-style: italic;
}

.translation-tips {
  text-align: center;
}

.translation-tips small {
  color: #6c757d;
  font-size: 0.8em;
  background: #f8f9fa;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  display: inline-block;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.question-meta {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.question-number {
  background: #667eea;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1.1em;
}

.question-topic {
  background: #f8f9fa;
  color: #495057;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
}

.question-part {
  background: #e3f2fd;
  color: #1976d2;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9em;
}

.question-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.question-id {
  color: #6c757d;
  font-size: 0.9em;
}

.question-section {
  color: #6c757d;
  font-size: 0.8em;
  text-align: right;
  max-width: 300px;
  word-wrap: break-word;
}

.question-content {
  margin-bottom: 25px;
}

.question-text-container {
  position: relative;
}

.question-text {
  user-select: text;
  cursor: text;
}

/* 高亮样式 */
.highlight-yellow {
  background-color: #ffeb3b;
  padding: 2px 4px;
  border-radius: 3px;
}

.highlight-green {
  background-color: #4caf50;
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
}

.highlight-blue {
  background-color: #2196f3;
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
}

.highlight-pink {
  background-color: #e91e63;
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
}

.highlight-orange {
  background-color: #ff9800;
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
}

/* 高亮工具栏 */
.highlight-toolbar {
  position: absolute;
  top: -60px;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #667eea;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.toolbar-content {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.selected-text {
  font-size: 0.9em;
  color: #666;
  font-style: italic;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.color-options {
  display: flex;
  gap: 8px;
}

.color-btn {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn:hover {
  transform: scale(1.1);
  border-color: #333;
}

.color-yellow {
  background-color: #ffeb3b;
}

.color-green {
  background-color: #4caf50;
}

.color-blue {
  background-color: #2196f3;
}

.color-pink {
  background-color: #e91e63;
}

.color-orange {
  background-color: #ff9800;
}

.cancel-highlight {
  background: #6c757d;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.cancel-highlight:hover {
  background: #5a6268;
}

/* 高亮管理 */
.highlight-management {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.highlight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.highlight-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.1em;
}

.clear-highlights-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.clear-highlights-btn:hover {
  background: #c82333;
}

.highlight-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.highlight-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.highlight-text {
  flex: 1;
  font-size: 0.9em;
  color: #333;
}

.remove-highlight-btn {
  background: #dc3545;
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-highlight-btn:hover {
  background: #c82333;
}

/* 笔记区域样式 */
.notes-section {
  margin-top: 30px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #28a745;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.notes-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.2em;
  font-weight: 600;
}

.notes-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.save-note-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 80px;
}

.save-note-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.save-note-btn.has-changes {
  background: #28a745;
  color: white;
  cursor: pointer;
}

.save-note-btn.has-changes:hover {
  background: #218838;
  transform: translateY(-1px);
}

.clear-note-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
}

.clear-note-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.note-count {
  color: #6c757d;
  font-size: 0.9em;
  font-weight: 500;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.notes-input-container {
  margin-bottom: 15px;
}

.notes-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1em;
  line-height: 1.5;
  font-family: inherit;
  resize: vertical;
  min-height: 230px;
  transition: border-color 0.3s ease;
  background: white;
}

.notes-textarea:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.notes-textarea::placeholder {
  color: #6c757d;
  font-style: italic;
}

.notes-tips {
  text-align: center;
}

.notes-tips small {
  color: #6c757d;
  font-size: 0.85em;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  display: inline-block;
}

.question-text {
  font-size: 1.2em;
  line-height: 1.6;
  color: #333;
  margin-bottom: 25px;
  font-weight: 500;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 18px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.option-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.option-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.option-label {
  background: #667eea;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 20px;
  flex-shrink: 0;
}

.option-item.selected .option-label {
  background: white;
  color: #667eea;
}

.option-text {
  flex: 1;
  font-size: 1em;
  line-height: 1.5;
}

.navigation {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
}

.nav-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.prev-btn {
  background: #6c757d;
  color: white;
}

.prev-btn:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
}

.next-btn {
  background: #667eea;
  color: white;
}

.next-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.nav-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}


.completion-page {
  background: white;
  border-radius: 15px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.completion-page h2 {
  color: #333;
  font-size: 2.5em;
  margin-bottom: 30px;
}

.completion-stats {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 40px;
}

.completion-stats p {
  font-size: 1.2em;
  margin: 10px 0;
  color: #495057;
}

.reset-btn {
  background: #667eea;
  color: white;
  padding: 15px 40px;
  border: none;
  border-radius: 8px;
  font-size: 1.2em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.loading {
  background: white;
  border-radius: 15px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.loading p {
  font-size: 1.3em;
  color: #666;
}

@media (max-width: 1200px) {
  .main-container {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 30px);
  }
  
  .question-nav-sidebar {
    width: 100%;
    height: 150px;
    order: 2;
  }
  
  .quiz-main {
    order: 1;
    min-height: 400px;
  }
  
  .translation-sidebar {
    width: 100%;
    order: 3;
  }
  
  .translation-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .translation-actions button {
    flex: 1;
    margin: 0 5px;
  }
}

@media (max-width: 768px) {
  .quiz-container {
    height: 100vh;
    overflow: auto;
  }
  
  .main-container {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 30px);
    gap: 10px;
  }
  
  .header-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-controls, .translation-controls {
    justify-content: center;
  }
  
  .translation-modal-content {
    width: 98%;
    max-height: 95vh;
  }
  
  .translation-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .translation-actions button {
    width: 100%;
  }
  
  .question-nav-sidebar {
    width: 100%;
    height: 120px;
    order: 2;
  }
  
  .question-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
    gap: 4px;
  }
  
  .question-nav-btn {
    height: 30px;
    font-size: 0.7em;
  }
  
  .quiz-main {
    padding: 15px;
    order: 1;
    min-height: 300px;
  }
  
  .question-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .question-meta {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .question-details {
    align-items: flex-start;
  }
  
  .question-section {
    text-align: left;
    max-width: 100%;
  }
  
  .navigation {
    flex-direction: column;
    gap: 15px;
  }
  
  .nav-btn {
    width: 100%;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-options {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .apply-filter-btn, .clear-filter-btn {
    width: 100%;
  }
  
  .filter-level-indicator {
    flex-direction: column;
    gap: 5px;
  }
  
  .level-arrow {
    transform: rotate(90deg);
  }
  
  .highlight-toolbar {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 400px;
  }
  
  .toolbar-content {
    flex-direction: column;
    gap: 10px;
  }
  
  .color-options {
    justify-content: center;
  }
  
  .highlight-management {
    margin-top: 20px;
    padding: 15px;
  }
  
  .highlight-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .highlight-color {
    align-self: flex-start;
  }
  
  .notes-section {
    margin-top: 20px;
    padding: 20px;
  }
  
  .notes-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .notes-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .notes-textarea {
    min-height: 80px;
    font-size: 0.9em;
  }
  
  .translation-sidebar {
    width: 100%;
    position: static;
    max-height: none;
  }
  
  .translation-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .translation-actions button {
    width: 100%;
    margin: 0;
  }
}
</style>
