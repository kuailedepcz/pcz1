const db = wx.cloud.database()
const timeCollection = db.collection('time_Order')
const visistorCollection =db.collection('custom_list')
let app=getApp()
let yyr = ""
let lxfs = ""
let lfr = ""
let yyrs = ""
let cgrq = null
let judge = null
let unionid = null
let openid =null
Page({
  data: {
    //"8:00-8:30","8:30-9:00","9:00-9:30","9:30-10:00","10:00-10:30","10:30-11:00","11:00-11:30","12:00-12:30","12:30-13:00","13:00-13:30","13:30-14:00","14:00-14:30","14:30-15:00","15:00-15:30","15:30-16:00","16:00-16:30","16:30-17:00"
    array: [],
    IDs: ["学生", "××法院", "××事业单位"],
    show: false,
    acknowledge: ["1、本馆开放时间： 周三、周五14点-17点；周六8点-12点、14点-17点。", "2、在开放时间参观，不收取任何费用。非开放时间参观只接待学校公务接待，其他类型参观须提前协商并额外支付工作人员费用（10人以下，100元/次；10人-20人，200元/次；20人-30人，300元/次）。",
      "3、参观时请勿触摸展品或设备设施，不要损坏公物；如有损毁，须照价赔偿并承担相应的法律责任。",
      "4、在参观期间，安全责任由参观个人或团队自行承担。",
      "5、请至少提前 1天 预约参观，因参观团队数量较多超过30人，请安排分批参观。请准时参观，若参观时间有变，请及时联系管理人员崔瑶或取消参观。",
      "6、非洲博物馆、中非交流博物馆暂不提供非普通话讲解。",
      "7、未尽事宜，请联系博物馆管理员崔瑶，联系方式：18958490058。"
    ],
    now_date:"",
    date: "",
    endDate: "",
    previousDate: "",
    selected:[],
    maxDate:"",
    minDate:"",
  },
  tabShow() {
    this.setData({
      show: true
    })
  },
  tabClose() {
    this.setData({
      show: false
    })
  },
  getDate() {
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    this.setData({
      date: y + "-" + m + "-" + d,
    })
  },
  getNowDate() {
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var nowDate = new Date(y + '/' + m  + '/' + d);
    // var nowDate = new Date(y,  m - 1 , d);
    this.setData({
      now_date: y + "-" + m + "-" + d,
      // minDate:nowDate.getTime()
      minDate: Date.parse(y + '/' + m  + '/' + d),
      
    })
  },
  
  getEndDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();

    // 将日期增加7天
    date.setDate(day + 6);

    // 考虑月份和年份变化
    if (date.getMonth() < month) {
      date.setMonth(date.getMonth() + 1);
      if (date.getFullYear() < year) {
        date.setFullYear(date.getFullYear() + 1);
      }
    } else if (date.getFullYear() < year) {
      date.setFullYear(date.getFullYear() + 1);
    }

    var edYear = date.getFullYear();
    var edMonth = date.getMonth() + 1;
    var edDay = date.getDate();
    var endDate0 = new Date(edYear + '/' + edMonth + '/' + edDay); // 构造日期对象
    this.setData({
      endDate: edYear + "-" + edMonth + "-" + edDay,
      maxDate: Date.parse(edYear + '/' + edMonth + '/' + edDay)
      // maxDate:endDate0.getTime()
    })
  },
  getPreviousDate() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
  
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
  
    // 考虑月份和年份的变化
    if (day === 0) {
      date.setDate(0);
      month = date.getMonth() + 1;
      day = date.getDate();
    }
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  
    var previousDate = year + "-" + month + "-" + day;
  
    this.setData({
      previousDate: previousDate
    });
  },
  selectTime(event){
    if(this.data.array.length==0){
      return;
    }
    var index = event.detail.value;
    var newArray = this.data.array;
    var newSelected = this.data.selected;
    if(newSelected.length>=2){
      wx.showToast({
        title: '最多只能选择2个时间段'
      })
      return;
    }
    newSelected.push(newArray[index]);
    newArray.splice(index,1);
    this.setData({
      array:newArray,
      selected:newSelected
    })
  },
  concelTime(event){
    var time = event.currentTarget.dataset.item;
    var newSelected = this.data.selected;
    var newArray  =this.data.array;
    for(var i = 0;i<newSelected.length;i++){
      if(newSelected[i]==time){
        newSelected.splice(i,1);
        break;
      }
    }
    newArray.push(time);
    newArray.sort();
    this.setData({
      array:newArray,
      selected:newSelected
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(app.globalData.greeting)
    this.getNowDate();
    this.getDate();
    this.getEndDate();
    this.getPreviousDate();
    console.log("最终的日期为"+this.data.maxDate)
    console.log("现在的日期为"+this.data.now_date)
    cgrq = this.data.date
    console.log(this.data.endDate.toString())
    //删除前一天的数据
    timeCollection.where({
        日期:this.data.previousDate.toString()
      }).remove().then(res => {
        console.log(res);
      })
      //如果没添加，则添加新增一天的数据
      timeCollection.where({
        日期: this.data.endDate.toString()
      }).get().then(res => {
        if (res.data.length === 0) {
          var date=["8:00-8:30","8:30-9:00","9:00-9:30","9:30-10:00","10:00-10:30","10:30-11:00","11:00-11:30","12:00-12:30","12:30-13:00","13:00-13:30","13:30-14:00","14:00-14:30","14:30-15:00","15:00-15:30","15:30-16:00","16:00-16:30","16:30-17:00"]
          for (var i = 0; i < 17; i++) {
            timeCollection.add({
              data: {
                日期:this.data.endDate.toString(),
                时间: date[i],
                是否为空:true,
                // _openid:"oXkIL5HNnJA1EppqXKklXmea3PgU"
              }
            }).then(res => {
              console.log("数据插入成功");
            }).catch(err => {
              console.error("数据插入失败", err);
            });
          }
        } else {
          console.log("已存在 enddate 的数据，无需插入");
        }
      }).catch(err => {
        console.error("数据库查询失败", err);
      });
      //选择空闲时间添加到选择中
    timeCollection.where({
      日期: cgrq.toString(),
      是否空闲: true
    }).get().then(res => {
      // 获取到数据后将数据存入 time 数组
      const data = res.data;
      const time = data.map(item => item.时间); // 假设时间字段为 "time"
      this.setData({
        // judge:res.data
        array: time,
      })
    })

//获取openid并存储在openid中
    wx.cloud.callFunction({
      name: 'get_Openid1',
      data: {},
      success: res => {
        // 获取到用户的openid
        openid = res.result.openid;
        console.log(res.result)
      },
      fail: err => {
        console.error('调用云函数失败', err);
      },
      complete: () => {
        console.log('云函数调用完成');
      }
    });


  },
  onDisplay() {
    this.setData({ calendar: true });
  },
  onClose() {
    this.setData({ calendar: false });
  },
  onChange1(event) {
    yyr = event.detail.value;
    // console.log(yyr)
  },
  onChange2(event) {
    lxfs = event.detail.value;
    console.log(lxfs);
  },
  onChange3(event) {
    lfr = event.detail.value;
    console.log(lfr);
  },
  onChange4(event) {
    yyrs = event.detail.value;
    if(yyrs>30){
      wx.showToast({
        title: '人数要少于30',
        icon: 'none',
        duration: 1000
      });
      yyrs=""
    }
    console.log(yyrs);
  },
  onChange5(event) {
    cgrq = this.formatDate(event.detail),
    this.setData({
      calendar: false,
      date: cgrq
    })
    timeCollection.where({
      日期: cgrq.toString(),
      是否空闲: true
    }).get().then(res => {
      // 获取到数据后将数据存入 time 数组
      const data = res.data;
      const time = data.map(item => item.时间); // 假设时间字段为 "time"
      this.setData({
        // judge:res.data
        array: time,
        selected:[]
      })
    })
    console.log(cgrq);
  },
  formatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },
  onClick1(event){
    judge=true
    //记得添加参观时间的判断
    while(yyr==""||lfr==""||yyrs==""||this.data.selected.length==0||lxfs==""){
      judge=false
      if(yyr==""){
        wx.showToast({
          title: '预约人不可为空',
          icon: 'none',
          duration: 1000
        });
        break;
      }

      if(lxfs==""){
        wx.showToast({
          title: '联系方式不可为空',
          icon: 'none',
          duration: 1000
        });
        break;
      }

      if(lfr==""){
        wx.showToast({
          title: '来访人不可为空',
          icon: 'none',
          duration: 1000
        });
        break;
      }
      if(yyrs==""){
        wx.showToast({
          title: '预约人数为空或者大于30',
          icon: 'none',
          duration: 1000
        });
        break;
      }
      if(this.data.selected.length==0){
        wx.showToast({
          title: '预约时间不可为空',
          icon: 'none',
          duration: 1000
        });
        break;
      }
    }
    if(judge==true){
      var time_choose="";
      for (var i = 0; i < this.data.selected.length; i++) {
        // time_choose = time_choose + this.data.selected[i] + " ";
        // console.log(this.data.selected[i].toString())
        timeCollection.where({
          时间: this.data.selected[i].toString(),
          日期: cgrq.toString()
        }).update({
          data: {
            是否空闲: false
          }
        }).then(res => {
          console.log("数据更新成功");
        }).catch(err => {
          console.error("数据更新失败", err);
        });
      
        visistorCollection.add({
          data: {
            预约人:yyr,
            联系方式: lxfs,
            来访人:lfr,
            预约人数:yyrs,
            参观时间:this.data.selected[i].toString(),
            参观日期:cgrq.toString(),
            预约日期:this.data.now_date.toString(),
            id:openid

          }
        }).then(res => {
          console.log("数据插入成功");
          wx.showToast({
            title: '数据插入成功',
            icon: 'none',
            duration: 1000
          });
        }).catch(err => {
          console.error("数据插入失败", err);
          wx.showToast({
            title: '数据插入失败',
            icon: 'none',
            duration: 1000
          });
        });
      }

       //发送订阅消息
        // wx.requestSubscribeMessage({
        //   tmplIds: ['PnOdpXkjsBkPNzrh2C91p71q9gALMnySBlUK4Z5rJRU'],
        //   success: res => {
        //     if (res.errMsg === 'requestSubscribeMessage:ok') {
        //       // 用户同意订阅消息
        //       console.log('订阅成功')
        //       // 调用云函数发送订阅消息
        //       wx.cloud.callFunction({
        //         name: 'send_message',
        //         data: {
        //           // 传递模板参数
        //           parameter: {
        //             // 模板数据
        //             key1: {
        //               value: yyr
        //             },
        //             key2: {
        //               value: this.data.now_date.toString()
        //             },
        //             key3: {
        //               value: 'lxfs'
        //             },
        //             key4: {
        //               value: cgrq+"  具体时间："+time_choose
        //             },
        //             key5: {
        //               value: "人数为："+yyrs+"  "+lfr
        //             },
        //           },
        //           // 用户的 OpenID
        //           touser: res.openid,
        //           // 订阅消息模板ID
        //           templateId: 'PnOdpXkjsBkPNzrh2C91p71q9gALMnySBlUK4Z5rJRU',
        //           // 点击订阅消息卡片后跳转的页面路径，可选
        //           page: '/pages/home/home'
        //         },
        //         success: res => {
        //           console.log('发送成功', res)
        //         },
        //         fail: err => {
        //           console.error('发送失败', err)
        //         }
        //       })
        //     } else {
        //       // 用户拒绝订阅消息
        //       console.log('订阅失败')
        //     }
        //   },
        //   fail: err => {
        //     console.error(err)
        //   }
        // })
   // 清空输入内容
    this.setData({
      inputContent: ''
    });
    
    // 刷新页面
    wx.redirectTo({
      url: '/pages/home/home'
    });
    }
  }
})