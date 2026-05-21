const app = getApp()

Page({
  data: {
    records: []
  },

  onLoad() {
    this.loadRecords()
  },

  onShow() {
    this.loadRecords()
  },

  loadRecords() {
    const records = wx.getStorageSync('incenseRecords') || []
    
    // 格式化日期显示
    const formattedRecords = records.map(record => {
      // 格式化日期为易读形式
      const dateParts = record.date.split('-')
      const month = parseInt(dateParts[1])
      const day = parseInt(dateParts[2])
      const weekDay = this.getWeekDay(record.date)
      
      return {
        ...record,
        displayDate: `${month}月${day}日 ${weekDay}`
      }
    })

    this.setData({
      records: formattedRecords
    })
  },

  getWeekDay(dateStr) {
    const date = new Date(dateStr)
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[date.getDay()]
  }
})
