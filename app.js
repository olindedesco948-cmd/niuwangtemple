App({
  globalData: {
    // 祈福时间窗口配置
    incenseWindows: {
      morning: { start: '09:00', end: '09:30', label: '开盘前' },
      evening: { start: '15:00', end: '22:00', label: '收盘后' }
    }
  },

  onLaunch() {
    // 初始化今日祈福记录
    this.initTodayRecord()
  },

  initTodayRecord() {
    const today = this.getTodayDate()
    const lastDate = wx.getStorageSync('lastRecordDate') || ''

    // 如果日期变了，重置状态
    if (lastDate !== today) {
      wx.setStorageSync('isIncensedToday', false)
      wx.setStorageSync('lastRecordDate', today)
    }
  },

  getTodayDate() {
    const now = this.getShanghaiTime()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  getShanghaiTime() {
    // 使用 Asia/Shanghai 时区
    const now = new Date()
    const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    return utc8
  },

  // 检查当前是否在祈福时间窗口内
  isInIncenseWindow() {
    const now = this.getShanghaiTime()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const currentTime = `${hours}:${minutes}`

    const { morning, evening } = this.globalData.incenseWindows

    // 检查早间窗口
    if (currentTime >= morning.start && currentTime <= morning.end) {
      return { inWindow: true, period: 'morning' }
    }

    // 检查收盘后窗口
    if (currentTime >= evening.start && currentTime <= evening.end) {
      return { inWindow: true, period: 'evening' }
    }

    return { inWindow: false, period: null }
  },

  // 获取下一个可祈福时间
  getNextIncenseTime() {
    const now = this.getShanghaiTime()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentMinutes = hours * 60 + minutes

    const morningStart = 9 * 60      // 09:00 = 540
    const morningEnd = 9 * 60 + 30    // 09:30 = 570
    const eveningStart = 15 * 60      // 15:00 = 900
    const eveningEnd = 22 * 60        // 22:00 = 1320

    const today = this.getTodayDate()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()

    // 早间窗口 09:00-09:30
    if (currentMinutes < morningStart) {
      return {
        time: '09:00',
        label: '早间窗口',
        date: today
      }
    }

    // 盘中 09:30-15:00
    if (currentMinutes >= morningEnd && currentMinutes < eveningStart) {
      return {
        time: '15:00',
        label: '收盘后窗口',
        date: today
      }
    }

    // 晚间窗口 15:00-22:00
    if (currentMinutes >= eveningStart && currentMinutes < eveningEnd) {
      return {
        time: '22:00',
        label: '收盘后窗口结束',
        date: today
      }
    }

    // 22:00后，返回明天早间
    return {
      time: '09:00',
      label: '早间窗口',
      date: this.getTomorrowDate()
    }
  },

  getTomorrowDate() {
    const now = this.getShanghaiTime()
    now.setDate(now.getDate() + 1)
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
})
