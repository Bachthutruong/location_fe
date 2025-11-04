// API for Taiwan administrative divisions
// Using OpenStreetMap Nominatim API and Taiwan government data

export interface TaiwanCity {
  code: string
  name: string
  nameEn: string
  districts: TaiwanDistrict[]
}

export interface TaiwanDistrict {
  code: string
  name: string
  nameEn: string
}

// Taiwan cities and districts data
// Source: Taiwan Ministry of Interior
const TAIWAN_CITIES: TaiwanCity[] = [
  {
    code: 'TPE',
    name: '臺北市',
    nameEn: 'Taipei City',
    districts: [
      { code: '100', name: '中正區', nameEn: 'Zhongzheng District' },
      { code: '103', name: '大同區', nameEn: 'Datong District' },
      { code: '104', name: '中山區', nameEn: 'Zhongshan District' },
      { code: '105', name: '松山區', nameEn: 'Songshan District' },
      { code: '106', name: '大安區', nameEn: 'Da\'an District' },
      { code: '108', name: '萬華區', nameEn: 'Wanhua District' },
      { code: '110', name: '信義區', nameEn: 'Xinyi District' },
      { code: '111', name: '士林區', nameEn: 'Shilin District' },
      { code: '112', name: '北投區', nameEn: 'Beitou District' },
      { code: '114', name: '內湖區', nameEn: 'Neihu District' },
      { code: '115', name: '南港區', nameEn: 'Nangang District' },
      { code: '116', name: '文山區', nameEn: 'Wenshan District' },
    ]
  },
  {
    code: 'NTP',
    name: '新北市',
    nameEn: 'New Taipei City',
    districts: [
      { code: '207', name: '萬里區', nameEn: 'Wanli District' },
      { code: '208', name: '金山區', nameEn: 'Jinshan District' },
      { code: '220', name: '板橋區', nameEn: 'Banqiao District' },
      { code: '221', name: '汐止區', nameEn: 'Xizhi District' },
      { code: '222', name: '深坑區', nameEn: 'Shenkeng District' },
      { code: '223', name: '石碇區', nameEn: 'Shiding District' },
      { code: '224', name: '瑞芳區', nameEn: 'Ruifang District' },
      { code: '226', name: '平溪區', nameEn: 'Pingxi District' },
      { code: '227', name: '雙溪區', nameEn: 'Shuangxi District' },
      { code: '228', name: '貢寮區', nameEn: 'Gongliao District' },
      { code: '231', name: '新店區', nameEn: 'Xindian District' },
      { code: '232', name: '坪林區', nameEn: 'Pinglin District' },
      { code: '233', name: '烏來區', nameEn: 'Wulai District' },
      { code: '234', name: '永和區', nameEn: 'Yonghe District' },
      { code: '235', name: '中和區', nameEn: 'Zhonghe District' },
      { code: '236', name: '土城區', nameEn: 'Tucheng District' },
      { code: '237', name: '三峽區', nameEn: 'Sanxia District' },
      { code: '238', name: '樹林區', nameEn: 'Shulin District' },
      { code: '239', name: '鶯歌區', nameEn: 'Yingge District' },
      { code: '241', name: '三重區', nameEn: 'Sanchong District' },
      { code: '242', name: '新莊區', nameEn: 'Xinzhuang District' },
      { code: '243', name: '泰山區', nameEn: 'Taishan District' },
      { code: '244', name: '林口區', nameEn: 'Linkou District' },
      { code: '247', name: '蘆洲區', nameEn: 'Luzhou District' },
      { code: '248', name: '五股區', nameEn: 'Wugu District' },
      { code: '249', name: '八里區', nameEn: 'Bali District' },
      { code: '251', name: '淡水區', nameEn: 'Tamsui District' },
      { code: '252', name: '三芝區', nameEn: 'Sanzhi District' },
      { code: '253', name: '石門區', nameEn: 'Shimen District' },
    ]
  },
  {
    code: 'TAO',
    name: '桃園市',
    nameEn: 'Taoyuan City',
    districts: [
      { code: '320', name: '中壢區', nameEn: 'Zhongli District' },
      { code: '324', name: '平鎮區', nameEn: 'Pingzhen District' },
      { code: '325', name: '龍潭區', nameEn: 'Longtan District' },
      { code: '326', name: '楊梅區', nameEn: 'Yangmei District' },
      { code: '327', name: '新屋區', nameEn: 'Xinwu District' },
      { code: '328', name: '觀音區', nameEn: 'Guanyin District' },
      { code: '330', name: '桃園區', nameEn: 'Taoyuan District' },
      { code: '333', name: '龜山區', nameEn: 'Guishan District' },
      { code: '334', name: '八德區', nameEn: 'Bade District' },
      { code: '335', name: '大溪區', nameEn: 'Daxi District' },
      { code: '336', name: '復興區', nameEn: 'Fuxing District' },
      { code: '337', name: '大園區', nameEn: 'Dayuan District' },
      { code: '338', name: '蘆竹區', nameEn: 'Luzhu District' },
    ]
  },
  {
    code: 'HSQ',
    name: '新竹縣',
    nameEn: 'Hsinchu County',
    districts: [
      { code: '302', name: '竹北市', nameEn: 'Zhubei City' },
      { code: '303', name: '湖口鄉', nameEn: 'Hukou Township' },
      { code: '304', name: '新豐鄉', nameEn: 'Xinfeng Township' },
      { code: '305', name: '新埔鎮', nameEn: 'Xinpu Township' },
      { code: '306', name: '關西鎮', nameEn: 'Guanxi Township' },
      { code: '307', name: '芎林鄉', nameEn: 'Qionglin Township' },
      { code: '308', name: '橫山鄉', nameEn: 'Hengshan Township' },
      { code: '310', name: '竹東鎮', nameEn: 'Zhudong Township' },
      { code: '311', name: '五峰鄉', nameEn: 'Wufeng Township' },
      { code: '312', name: '尖石鄉', nameEn: 'Jianshi Township' },
      { code: '313', name: '北埔鄉', nameEn: 'Beipu Township' },
      { code: '314', name: '寶山鄉', nameEn: 'Baoshan Township' },
      { code: '315', name: '峨眉鄉', nameEn: 'Emei Township' },
    ]
  },
  {
    code: 'MIA',
    name: '苗栗縣',
    nameEn: 'Miaoli County',
    districts: [
      { code: '350', name: '竹南鎮', nameEn: 'Zhunan Township' },
      { code: '351', name: '頭份市', nameEn: 'Toufen City' },
      { code: '352', name: '三灣鄉', nameEn: 'Sanwan Township' },
      { code: '353', name: '南庄鄉', nameEn: 'Nanzhuang Township' },
      { code: '354', name: '獅潭鄉', nameEn: 'Shitan Township' },
      { code: '356', name: '後龍鎮', nameEn: 'Houlong Township' },
      { code: '357', name: '通霄鎮', nameEn: 'Tongxiao Township' },
      { code: '358', name: '苑裡鎮', nameEn: 'Yuanli Township' },
      { code: '360', name: '苗栗市', nameEn: 'Miaoli City' },
      { code: '361', name: '造橋鄉', nameEn: 'Zaoqiao Township' },
      { code: '362', name: '頭屋鄉', nameEn: 'Touwu Township' },
      { code: '363', name: '公館鄉', nameEn: 'Gongguan Township' },
      { code: '364', name: '大湖鄉', nameEn: 'Dahu Township' },
      { code: '365', name: '泰安鄉', nameEn: 'Taian Township' },
      { code: '366', name: '銅鑼鄉', nameEn: 'Tongluo Township' },
      { code: '367', name: '三義鄉', nameEn: 'Sanyi Township' },
      { code: '368', name: '西湖鄉', nameEn: 'Xihu Township' },
      { code: '369', name: '卓蘭鎮', nameEn: 'Zhuolan Township' },
    ]
  },
  {
    code: 'TXG',
    name: '臺中市',
    nameEn: 'Taichung City',
    districts: [
      { code: '400', name: '中區', nameEn: 'Central District' },
      { code: '401', name: '東區', nameEn: 'East District' },
      { code: '402', name: '南區', nameEn: 'South District' },
      { code: '403', name: '西區', nameEn: 'West District' },
      { code: '404', name: '北區', nameEn: 'North District' },
      { code: '406', name: '北屯區', nameEn: 'Beitun District' },
      { code: '407', name: '西屯區', nameEn: 'Xitun District' },
      { code: '408', name: '南屯區', nameEn: 'Nantun District' },
      { code: '411', name: '太平區', nameEn: 'Taiping District' },
      { code: '412', name: '大里區', nameEn: 'Dali District' },
      { code: '413', name: '霧峰區', nameEn: 'Wufeng District' },
      { code: '414', name: '烏日區', nameEn: 'Wuri District' },
      { code: '420', name: '豐原區', nameEn: 'Fengyuan District' },
      { code: '421', name: '后里區', nameEn: 'Houli District' },
      { code: '422', name: '石岡區', nameEn: 'Shigang District' },
      { code: '423', name: '東勢區', nameEn: 'Dongshi District' },
      { code: '424', name: '和平區', nameEn: 'Heping District' },
      { code: '426', name: '新社區', nameEn: 'Xinshe District' },
      { code: '427', name: '潭子區', nameEn: 'Tanzi District' },
      { code: '428', name: '大雅區', nameEn: 'Daya District' },
      { code: '429', name: '神岡區', nameEn: 'Shengang District' },
      { code: '432', name: '大肚區', nameEn: 'Dadu District' },
      { code: '433', name: '沙鹿區', nameEn: 'Shalu District' },
      { code: '434', name: '龍井區', nameEn: 'Longjing District' },
      { code: '435', name: '梧棲區', nameEn: 'Wuqi District' },
      { code: '436', name: '清水區', nameEn: 'Qingshui District' },
      { code: '437', name: '大甲區', nameEn: 'Dajia District' },
      { code: '438', name: '外埔區', nameEn: 'Waipu District' },
      { code: '439', name: '大安區', nameEn: 'Da\'an District' },
    ]
  },
  {
    code: 'CHA',
    name: '彰化縣',
    nameEn: 'Changhua County',
    districts: [
      { code: '500', name: '彰化市', nameEn: 'Changhua City' },
      { code: '502', name: '芬園鄉', nameEn: 'Fenyuan Township' },
      { code: '503', name: '花壇鄉', nameEn: 'Huatan Township' },
      { code: '504', name: '秀水鄉', nameEn: 'Xiushui Township' },
      { code: '505', name: '鹿港鎮', nameEn: 'Lukang Township' },
      { code: '506', name: '福興鄉', nameEn: 'Fuxing Township' },
      { code: '507', name: '線西鄉', nameEn: 'Xianxi Township' },
      { code: '508', name: '和美鎮', nameEn: 'Hemei Township' },
      { code: '509', name: '伸港鄉', nameEn: 'Shengang Township' },
      { code: '510', name: '員林市', nameEn: 'Yuanlin City' },
      { code: '511', name: '社頭鄉', nameEn: 'Shetou Township' },
      { code: '512', name: '永靖鄉', nameEn: 'Yongjing Township' },
      { code: '513', name: '埔心鄉', nameEn: 'Puxin Township' },
      { code: '514', name: '溪湖鎮', nameEn: 'Xihu Township' },
      { code: '515', name: '大村鄉', nameEn: 'Dacun Township' },
      { code: '516', name: '埔鹽鄉', nameEn: 'Puyan Township' },
      { code: '520', name: '田中鎮', nameEn: 'Tianzhong Township' },
      { code: '521', name: '北斗鎮', nameEn: 'Beidou Township' },
      { code: '522', name: '田尾鄉', nameEn: 'Tianwei Township' },
      { code: '523', name: '埤頭鄉', nameEn: 'Pitou Township' },
      { code: '524', name: '溪州鄉', nameEn: 'Xizhou Township' },
      { code: '525', name: '竹塘鄉', nameEn: 'Zhutang Township' },
      { code: '526', name: '二林鎮', nameEn: 'Erlin Township' },
      { code: '527', name: '大城鄉', nameEn: 'Dacheng Township' },
      { code: '528', name: '芳苑鄉', nameEn: 'Fangyuan Township' },
      { code: '530', name: '二水鄉', nameEn: 'Ershui Township' },
    ]
  },
  {
    code: 'NAN',
    name: '南投縣',
    nameEn: 'Nantou County',
    districts: [
      { code: '540', name: '南投市', nameEn: 'Nantou City' },
      { code: '541', name: '中寮鄉', nameEn: 'Zhongliao Township' },
      { code: '542', name: '草屯鎮', nameEn: 'Caotun Township' },
      { code: '544', name: '國姓鄉', nameEn: 'Guoxing Township' },
      { code: '545', name: '埔里鎮', nameEn: 'Puli Township' },
      { code: '546', name: '仁愛鄉', nameEn: 'Renai Township' },
      { code: '551', name: '名間鄉', nameEn: 'Mingjian Township' },
      { code: '552', name: '集集鎮', nameEn: 'Jiji Township' },
      { code: '553', name: '水里鄉', nameEn: 'Shuili Township' },
      { code: '555', name: '魚池鄉', nameEn: 'Yuchi Township' },
      { code: '556', name: '信義鄉', nameEn: 'Xinyi Township' },
      { code: '557', name: '竹山鎮', nameEn: 'Zhushan Township' },
      { code: '558', name: '鹿谷鄉', nameEn: 'Lugu Township' },
    ]
  },
  {
    code: 'YUN',
    name: '雲林縣',
    nameEn: 'Yunlin County',
    districts: [
      { code: '630', name: '斗南鎮', nameEn: 'Dounan Township' },
      { code: '631', name: '大埤鄉', nameEn: 'Dapi Township' },
      { code: '632', name: '虎尾鎮', nameEn: 'Huwei Township' },
      { code: '633', name: '土庫鎮', nameEn: 'Tuku Township' },
      { code: '634', name: '褒忠鄉', nameEn: 'Baozhong Township' },
      { code: '635', name: '東勢鄉', nameEn: 'Dongshi Township' },
      { code: '636', name: '臺西鄉', nameEn: 'Taixi Township' },
      { code: '637', name: '崙背鄉', nameEn: 'Lunbei Township' },
      { code: '638', name: '麥寮鄉', nameEn: 'Mailiao Township' },
      { code: '640', name: '斗六市', nameEn: 'Douliu City' },
      { code: '643', name: '林內鄉', nameEn: 'Linnei Township' },
      { code: '646', name: '古坑鄉', nameEn: 'Gukeng Township' },
      { code: '647', name: '莿桐鄉', nameEn: 'Citong Township' },
      { code: '648', name: '西螺鎮', nameEn: 'Xiluo Township' },
      { code: '649', name: '二崙鄉', nameEn: 'Erlun Township' },
      { code: '651', name: '北港鎮', nameEn: 'Beigang Township' },
      { code: '652', name: '水林鄉', nameEn: 'Shuilin Township' },
      { code: '653', name: '口湖鄉', nameEn: 'Kouhu Township' },
      { code: '654', name: '四湖鄉', nameEn: 'Sihu Township' },
      { code: '655', name: '元長鄉', nameEn: 'Yuanchang Township' },
    ]
  },
  {
    code: 'CYI',
    name: '嘉義市',
    nameEn: 'Chiayi City',
    districts: [
      { code: '600', name: '東區', nameEn: 'East District' },
      { code: '600', name: '西區', nameEn: 'West District' },
    ]
  },
  {
    code: 'CYQ',
    name: '嘉義縣',
    nameEn: 'Chiayi County',
    districts: [
      { code: '602', name: '番路鄉', nameEn: 'Fanlu Township' },
      { code: '603', name: '梅山鄉', nameEn: 'Meishan Township' },
      { code: '604', name: '竹崎鄉', nameEn: 'Zhuqi Township' },
      { code: '605', name: '阿里山鄉', nameEn: 'Alishan Township' },
      { code: '606', name: '中埔鄉', nameEn: 'Zhongpu Township' },
      { code: '607', name: '大埔鄉', nameEn: 'Dapu Township' },
      { code: '608', name: '水上鄉', nameEn: 'Shuishang Township' },
      { code: '611', name: '鹿草鄉', nameEn: 'Lucao Township' },
      { code: '612', name: '太保市', nameEn: 'Taibao City' },
      { code: '613', name: '朴子市', nameEn: 'Puzi City' },
      { code: '614', name: '東石鄉', nameEn: 'Dongshi Township' },
      { code: '615', name: '六腳鄉', nameEn: 'Liujiao Township' },
      { code: '616', name: '新港鄉', nameEn: 'Xingang Township' },
      { code: '621', name: '民雄鄉', nameEn: 'Minxiong Township' },
      { code: '622', name: '大林鎮', nameEn: 'Dalin Township' },
      { code: '623', name: '溪口鄉', nameEn: 'Xikou Township' },
      { code: '624', name: '義竹鄉', nameEn: 'Yizhu Township' },
      { code: '625', name: '布袋鎮', nameEn: 'Budai Township' },
    ]
  },
  {
    code: 'TNN',
    name: '臺南市',
    nameEn: 'Tainan City',
    districts: [
      { code: '700', name: '中西區', nameEn: 'West Central District' },
      { code: '701', name: '東區', nameEn: 'East District' },
      { code: '702', name: '南區', nameEn: 'South District' },
      { code: '704', name: '北區', nameEn: 'North District' },
      { code: '708', name: '安平區', nameEn: 'Anping District' },
      { code: '709', name: '安南區', nameEn: 'Annan District' },
      { code: '710', name: '永康區', nameEn: 'Yongkang District' },
      { code: '711', name: '歸仁區', nameEn: 'Guiren District' },
      { code: '712', name: '新化區', nameEn: 'Xinhua District' },
      { code: '713', name: '左鎮區', nameEn: 'Zuozhen District' },
      { code: '714', name: '玉井區', nameEn: 'Yujing District' },
      { code: '715', name: '楠西區', nameEn: 'Nanxi District' },
      { code: '716', name: '南化區', nameEn: 'Nanhua District' },
      { code: '717', name: '仁德區', nameEn: 'Rende District' },
      { code: '718', name: '關廟區', nameEn: 'Guanmiao District' },
      { code: '719', name: '龍崎區', nameEn: 'Longqi District' },
      { code: '720', name: '官田區', nameEn: 'Guantian District' },
      { code: '721', name: '麻豆區', nameEn: 'Madou District' },
      { code: '722', name: '佳里區', nameEn: 'Jiali District' },
      { code: '723', name: '西港區', nameEn: 'Xigang District' },
      { code: '724', name: '七股區', nameEn: 'Qigu District' },
      { code: '725', name: '將軍區', nameEn: 'Jiangjun District' },
      { code: '726', name: '學甲區', nameEn: 'Xuejia District' },
      { code: '727', name: '北門區', nameEn: 'Beimen District' },
      { code: '730', name: '新營區', nameEn: 'Xinying District' },
      { code: '731', name: '後壁區', nameEn: 'Houbi District' },
      { code: '732', name: '白河區', nameEn: 'Baihe District' },
      { code: '733', name: '東山區', nameEn: 'Dongshan District' },
      { code: '734', name: '六甲區', nameEn: 'Liujia District' },
      { code: '735', name: '下營區', nameEn: 'Xiaying District' },
      { code: '736', name: '柳營區', nameEn: 'Liuying District' },
      { code: '737', name: '鹽水區', nameEn: 'Yanshui District' },
      { code: '741', name: '善化區', nameEn: 'Shanhua District' },
      { code: '742', name: '大內區', nameEn: 'Danei District' },
      { code: '743', name: '山上區', nameEn: 'Shanshang District' },
      { code: '744', name: '新市區', nameEn: 'Xinshi District' },
      { code: '745', name: '安定區', nameEn: 'Anding District' },
    ]
  },
  {
    code: 'KHH',
    name: '高雄市',
    nameEn: 'Kaohsiung City',
    districts: [
      { code: '800', name: '新興區', nameEn: 'Xinxing District' },
      { code: '801', name: '前金區', nameEn: 'Qianjin District' },
      { code: '802', name: '苓雅區', nameEn: 'Lingya District' },
      { code: '803', name: '鹽埕區', nameEn: 'Yancheng District' },
      { code: '804', name: '鼓山區', nameEn: 'Gushan District' },
      { code: '805', name: '旗津區', nameEn: 'Qijin District' },
      { code: '806', name: '前鎮區', nameEn: 'Qianzhen District' },
      { code: '807', name: '三民區', nameEn: 'Sanmin District' },
      { code: '811', name: '楠梓區', nameEn: 'Nanzi District' },
      { code: '812', name: '小港區', nameEn: 'Xiaogang District' },
      { code: '813', name: '左營區', nameEn: 'Zuoying District' },
      { code: '814', name: '仁武區', nameEn: 'Renwu District' },
      { code: '815', name: '大社區', nameEn: 'Dashe District' },
      { code: '820', name: '岡山區', nameEn: 'Gangshan District' },
      { code: '821', name: '路竹區', nameEn: 'Luzhu District' },
      { code: '822', name: '阿蓮區', nameEn: 'Alian District' },
      { code: '823', name: '田寮區', nameEn: 'Tianliao District' },
      { code: '824', name: '燕巢區', nameEn: 'Yanchao District' },
      { code: '825', name: '橋頭區', nameEn: 'Qiaotou District' },
      { code: '826', name: '梓官區', nameEn: 'Ziguan District' },
      { code: '827', name: '彌陀區', nameEn: 'Mituo District' },
      { code: '828', name: '永安區', nameEn: 'Yong\'an District' },
      { code: '829', name: '湖內區', nameEn: 'Hunei District' },
      { code: '830', name: '鳳山區', nameEn: 'Fengshan District' },
      { code: '831', name: '大寮區', nameEn: 'Daliao District' },
      { code: '832', name: '林園區', nameEn: 'Linyuan District' },
      { code: '833', name: '鳥松區', nameEn: 'Niaosong District' },
      { code: '840', name: '大樹區', nameEn: 'Dashu District' },
      { code: '842', name: '旗山區', nameEn: 'Qishan District' },
      { code: '843', name: '美濃區', nameEn: 'Meinong District' },
      { code: '844', name: '六龜區', nameEn: 'Liugui District' },
      { code: '845', name: '內門區', nameEn: 'Neimen District' },
      { code: '846', name: '杉林區', nameEn: 'Shanlin District' },
      { code: '847', name: '甲仙區', nameEn: 'Jiaxian District' },
      { code: '848', name: '桃源區', nameEn: 'Taoyuan District' },
      { code: '849', name: '那瑪夏區', nameEn: 'Namaxia District' },
      { code: '851', name: '茂林區', nameEn: 'Maolin District' },
    ]
  },
  {
    code: 'PIF',
    name: '屏東縣',
    nameEn: 'Pingtung County',
    districts: [
      { code: '900', name: '屏東市', nameEn: 'Pingtung City' },
      { code: '901', name: '三地門鄉', nameEn: 'Sandimen Township' },
      { code: '902', name: '霧臺鄉', nameEn: 'Wutai Township' },
      { code: '903', name: '瑪家鄉', nameEn: 'Majia Township' },
      { code: '904', name: '九如鄉', nameEn: 'Jiuru Township' },
      { code: '905', name: '里港鄉', nameEn: 'Ligang Township' },
      { code: '906', name: '高樹鄉', nameEn: 'Gaoshu Township' },
      { code: '907', name: '鹽埔鄉', nameEn: 'Yanpu Township' },
      { code: '908', name: '長治鄉', nameEn: 'Changzhi Township' },
      { code: '909', name: '麟洛鄉', nameEn: 'Linluo Township' },
      { code: '911', name: '竹田鄉', nameEn: 'Zhutian Township' },
      { code: '912', name: '內埔鄉', nameEn: 'Neipu Township' },
      { code: '913', name: '萬丹鄉', nameEn: 'Wandan Township' },
      { code: '920', name: '潮州鎮', nameEn: 'Chaozhou Township' },
      { code: '921', name: '泰武鄉', nameEn: 'Taiwu Township' },
      { code: '922', name: '來義鄉', nameEn: 'Laiyi Township' },
      { code: '923', name: '萬巒鄉', nameEn: 'Wanluan Township' },
      { code: '924', name: '崁頂鄉', nameEn: 'Kanding Township' },
      { code: '925', name: '新埤鄉', nameEn: 'Xinpi Township' },
      { code: '926', name: '南州鄉', nameEn: 'Nanzhou Township' },
      { code: '927', name: '林邊鄉', nameEn: 'Linbian Township' },
      { code: '928', name: '東港鎮', nameEn: 'Donggang Township' },
      { code: '929', name: '琉球鄉', nameEn: 'Liuqiu Township' },
      { code: '931', name: '佳冬鄉', nameEn: 'Jiadong Township' },
      { code: '932', name: '新園鄉', nameEn: 'Xinyuan Township' },
      { code: '940', name: '枋寮鄉', nameEn: 'Fangliao Township' },
      { code: '941', name: '枋山鄉', nameEn: 'Fangshan Township' },
      { code: '942', name: '春日鄉', nameEn: 'Chunri Township' },
      { code: '943', name: '獅子鄉', nameEn: 'Shizi Township' },
      { code: '944', name: '車城鄉', nameEn: 'Checheng Township' },
      { code: '945', name: '牡丹鄉', nameEn: 'Mudan Township' },
      { code: '946', name: '恆春鎮', nameEn: 'Hengchun Township' },
      { code: '947', name: '滿州鄉', nameEn: 'Manzhou Township' },
    ]
  },
  {
    code: 'TTT',
    name: '臺東縣',
    nameEn: 'Taitung County',
    districts: [
      { code: '950', name: '臺東市', nameEn: 'Taitung City' },
      { code: '951', name: '綠島鄉', nameEn: 'Ludao Township' },
      { code: '952', name: '蘭嶼鄉', nameEn: 'Lanyu Township' },
      { code: '953', name: '延平鄉', nameEn: 'Yanping Township' },
      { code: '954', name: '卑南鄉', nameEn: 'Beinan Township' },
      { code: '955', name: '鹿野鄉', nameEn: 'Luye Township' },
      { code: '956', name: '關山鎮', nameEn: 'Guanshan Township' },
      { code: '957', name: '海端鄉', nameEn: 'Haiduan Township' },
      { code: '958', name: '池上鄉', nameEn: 'Chishang Township' },
      { code: '959', name: '東河鄉', nameEn: 'Donghe Township' },
      { code: '961', name: '成功鎮', nameEn: 'Chenggong Township' },
      { code: '962', name: '長濱鄉', nameEn: 'Changbin Township' },
      { code: '963', name: '太麻里鄉', nameEn: 'Taimali Township' },
      { code: '964', name: '金峰鄉', nameEn: 'Jinfeng Township' },
      { code: '965', name: '大武鄉', nameEn: 'Dawu Township' },
      { code: '966', name: '達仁鄉', nameEn: 'Daren Township' },
    ]
  },
  {
    code: 'HUA',
    name: '花蓮縣',
    nameEn: 'Hualien County',
    districts: [
      { code: '970', name: '花蓮市', nameEn: 'Hualien City' },
      { code: '971', name: '新城鄉', nameEn: 'Xincheng Township' },
      { code: '972', name: '太魯閣', nameEn: 'Taroko' },
      { code: '973', name: '秀林鄉', nameEn: 'Xiulin Township' },
      { code: '974', name: '吉安鄉', nameEn: 'Ji\'an Township' },
      { code: '975', name: '壽豐鄉', nameEn: 'Shoufeng Township' },
      { code: '976', name: '鳳林鎮', nameEn: 'Fenglin Township' },
      { code: '977', name: '光復鄉', nameEn: 'Guangfu Township' },
      { code: '978', name: '豐濱鄉', nameEn: 'Fengbin Township' },
      { code: '979', name: '瑞穗鄉', nameEn: 'Ruixi Township' },
      { code: '981', name: '玉里鎮', nameEn: 'Yuli Township' },
      { code: '982', name: '卓溪鄉', nameEn: 'Zhuoxi Township' },
      { code: '983', name: '富里鄉', nameEn: 'Fuli Township' },
    ]
  },
  {
    code: 'PEN',
    name: '澎湖縣',
    nameEn: 'Penghu County',
    districts: [
      { code: '880', name: '馬公市', nameEn: 'Magong City' },
      { code: '881', name: '西嶼鄉', nameEn: 'Xiyu Township' },
      { code: '882', name: '望安鄉', nameEn: 'Wang\'an Township' },
      { code: '883', name: '七美鄉', nameEn: 'Qimei Township' },
      { code: '884', name: '白沙鄉', nameEn: 'Baisha Township' },
      { code: '885', name: '湖西鄉', nameEn: 'Huxi Township' },
    ]
  },
  {
    code: 'KIN',
    name: '金門縣',
    nameEn: 'Kinmen County',
    districts: [
      { code: '890', name: '金沙鎮', nameEn: 'Jinsha Township' },
      { code: '891', name: '金湖鎮', nameEn: 'Jinhu Township' },
      { code: '892', name: '金寧鄉', nameEn: 'Jinning Township' },
      { code: '893', name: '金城鎮', nameEn: 'Jincheng Township' },
      { code: '894', name: '烈嶼鄉', nameEn: 'Lieyu Township' },
      { code: '896', name: '烏坵鄉', nameEn: 'Wuqiu Township' },
    ]
  },
  {
    code: 'LIE',
    name: '連江縣',
    nameEn: 'Lienchiang County',
    districts: [
      { code: '209', name: '南竿鄉', nameEn: 'Nangan Township' },
      { code: '210', name: '北竿鄉', nameEn: 'Beigan Township' },
      { code: '211', name: '莒光鄉', nameEn: 'Juguang Township' },
      { code: '212', name: '東引鄉', nameEn: 'Dongyin Township' },
    ]
  },
]

// Get all cities
export const getTaiwanCities = (): TaiwanCity[] => {
  return TAIWAN_CITIES
}

// Get districts by city code
export const getDistrictsByCity = (cityCode: string): TaiwanDistrict[] => {
  const city = TAIWAN_CITIES.find(c => c.code === cityCode)
  return city ? city.districts : []
}

// Get districts by city name
export const getDistrictsByCityName = (cityName: string): TaiwanDistrict[] => {
  const city = TAIWAN_CITIES.find(c => 
    c.name === cityName || 
    c.nameEn === cityName ||
    c.name.includes(cityName) ||
    c.nameEn.includes(cityName)
  )
  return city ? city.districts : []
}

// Search cities by name
export const searchCities = (query: string): TaiwanCity[] => {
  if (!query) return TAIWAN_CITIES
  const lowerQuery = query.toLowerCase()
  return TAIWAN_CITIES.filter(city => 
    city.name.includes(query) ||
    city.nameEn.toLowerCase().includes(lowerQuery) ||
    city.code.toLowerCase().includes(lowerQuery)
  )
}

// Search districts by name
export const searchDistricts = (query: string, cityCode?: string): TaiwanDistrict[] => {
  const cities = cityCode 
    ? TAIWAN_CITIES.filter(c => c.code === cityCode)
    : TAIWAN_CITIES
  
  const districts: TaiwanDistrict[] = []
  cities.forEach(city => {
    city.districts.forEach(district => {
      if (!query || 
          district.name.includes(query) ||
          district.nameEn.toLowerCase().includes(query.toLowerCase())) {
        districts.push(district)
      }
    })
  })
  
  return districts
}

