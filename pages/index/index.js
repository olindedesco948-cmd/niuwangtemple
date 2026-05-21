const app = getApp()

// 祈福语列表
const blessings = [
  '愿今日心态比指数更稳',
  '愿红盘常在，回撤有度',
  '愿手别乱点，心别乱跳',
  '愿看得懂趋势，也忍得住冲动',
  '愿账户曲线平稳向上',
  '愿买得安心，持有淡定',
  '愿错过的不后悔，拿住的不焦虑',
  '愿财不入急门，福不忘本心',
  '愿每笔交易都有计划',
  '愿大跌不慌，大涨不狂'
]

// 时段标签
const periodLabels = {
  morning: '开盘前',
  evening: '收盘后'
}

Page({
  data: {
    heroImage: '/assets/images/hero.png',
    canIncense: false,
    isIncensedToday: false,
    isIncensed: false,
    showBlessing: false,
    statusTitle: '',
    statusDesc: '',
    mainButtonText: '点香祈福',
    todayBlessing: '',
    nextTime: '',
    nextPeriod: '',
    blessingPeriod: ''
  },

  onLoad() {
    this.refreshStatus()
  },

  onShow() {
    // 每次显示页面时刷新状态
    this.refreshStatus()
  },

  onPullDownRefresh() {
    this.refreshStatus()
    wx.stopPullDownRefresh()
  },

  refreshStatus() {
    const windowStatus = app.isInIncenseWindow()
    const isIncensedToday = wx.getStorageSync('isIncensedToday') || false
    const todayBlessing = wx.getStorageSync('todayBlessing') || ''
    const blessingPeriod = wx.getStorageSync('blessingPeriod') || ''
    const nextTimeInfo = app.getNextIncenseTime()

    let statusTitle, statusDesc, mainButtonText

    if (isIncensedToday) {
      // 今日已上香
      statusTitle = '今日香火已燃'
      statusDesc = '心意已到，明日再来'
      mainButtonText = '今日已上香'
    } else if (windowStatus.inWindow) {
      // 可上香
      statusTitle = '今日香火正旺'
      statusDesc = `宜${periodLabels[windowStatus.period]}祈福`
      mainButtonText = '点香祈福'
    } else {
      // 不可上香
      statusTitle = '未到上香时辰'
      statusDesc = '请在指定时段前来'
      mainButtonText = '未到上香时辰'
    }

    this.setData({
      canIncense: windowStatus.inWindow,
      isIncensedToday,
      isIncensed: isIncensedToday,
      showBlessing: isIncensedToday,
      statusTitle,
      statusDesc,
      mainButtonText,
      todayBlessing,
      blessingPeriod,
      nextTime: nextTimeInfo.time,
      nextPeriod: nextTimeInfo.label
    })
  },

  onIncenseTap() {
    if (!this.data.canIncense || this.data.isIncensedToday) {
      return
    }

    // 随机选择一条祈福语
    const randomIndex = Math.floor(Math.random() * blessings.length)
    const blessing = blessings[randomIndex]

    // 获取当前时段
    const windowStatus = app.isInIncenseWindow()
    const period = periodLabels[windowStatus.period]

    // 保存今日祈福记录
    this.saveIncenseRecord(blessing, period)

    // 触发动画
    this.triggerIncenseAnimation()

    // 更新状态
    this.setData({
      isIncensed: true,
      showBlessing: true,
      todayBlessing: blessing,
      blessingPeriod: period,
      isIncensedToday: true,
      statusTitle: '今日香火已燃',
      statusDesc: '心意已到，明日再来',
      mainButtonText: '今日已上香'
    })
  },

  saveIncenseRecord(blessing, period) {
    const today = app.getTodayDate()
    const now = app.getShanghaiTime()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // 保存到今日记录
    wx.setStorageSync('isIncensedToday', true)
    wx.setStorageSync('todayBlessing', blessing)
    wx.setStorageSync('blessingPeriod', period)
    wx.setStorageSync('lastRecordDate', today)
    wx.setStorageSync('lastIncenseTime', timeStr)

    // 获取历史记录
    const records = wx.getStorageSync('incenseRecords') || []

    // 添加新记录
    const newRecord = {
      date: today,
      time: timeStr,
      period,
      blessing
    }

    // 插入到最前面
    records.unshift(newRecord)

    // 只保留最近7条
    const recentRecords = records.slice(0, 7)

    wx.setStorageSync('incenseRecords', recentRecords)
  },

  triggerIncenseAnimation() {
    // 动画效果：触发后端同步播放
    // 这里通过改变样式类来触发 CSS 动画
    // 实际动画由 WXSS 控制
  },

  goToRecords() {
    wx.navigateTo({
      url: '/pages/records/records'
    })
  },

  onHeroImageError() {
    // 图片加载失败时使用备用图片
    this.setData({
      heroImage: '/assets/images/niu-wang-miao-hero.png'
    })
  }
})
