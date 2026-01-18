// 中国省市区数据（简化版，包含主要省市）
export interface District {
  name: string;
}

export interface City {
  name: string;
  districts: District[];
}

export interface Province {
  name: string;
  cities: City[];
}

export const regions: Province[] = [
  {
    name: '广东省',
    cities: [
      {
        name: '广州市',
        districts: [
          { name: '天河区' },
          { name: '越秀区' },
          { name: '海珠区' },
          { name: '荔湾区' },
          { name: '白云区' },
          { name: '黄埔区' },
          { name: '番禺区' },
          { name: '花都区' },
          { name: '南沙区' },
          { name: '增城区' },
          { name: '从化区' },
        ],
      },
      {
        name: '深圳市',
        districts: [
          { name: '福田区' },
          { name: '罗湖区' },
          { name: '南山区' },
          { name: '宝安区' },
          { name: '龙岗区' },
          { name: '盐田区' },
          { name: '龙华区' },
          { name: '坪山区' },
          { name: '光明区' },
        ],
      },
      {
        name: '东莞市',
        districts: [
          { name: '莞城区' },
          { name: '南城区' },
          { name: '东城区' },
          { name: '万江区' },
          { name: '长安镇' },
          { name: '虎门镇' },
          { name: '厚街镇' },
          { name: '塘厦镇' },
        ],
      },
      {
        name: '佛山市',
        districts: [
          { name: '禅城区' },
          { name: '南海区' },
          { name: '顺德区' },
          { name: '三水区' },
          { name: '高明区' },
        ],
      },
      {
        name: '珠海市',
        districts: [
          { name: '香洲区' },
          { name: '斗门区' },
          { name: '金湾区' },
        ],
      },
      {
        name: '中山市',
        districts: [
          { name: '石岐区' },
          { name: '东区' },
          { name: '西区' },
          { name: '南区' },
          { name: '火炬开发区' },
        ],
      },
      {
        name: '惠州市',
        districts: [
          { name: '惠城区' },
          { name: '惠阳区' },
          { name: '惠东县' },
          { name: '博罗县' },
          { name: '龙门县' },
        ],
      },
    ],
  },
  {
    name: '北京市',
    cities: [
      {
        name: '北京市',
        districts: [
          { name: '东城区' },
          { name: '西城区' },
          { name: '朝阳区' },
          { name: '丰台区' },
          { name: '石景山区' },
          { name: '海淀区' },
          { name: '门头沟区' },
          { name: '房山区' },
          { name: '通州区' },
          { name: '顺义区' },
          { name: '昌平区' },
          { name: '大兴区' },
          { name: '怀柔区' },
          { name: '平谷区' },
          { name: '密云区' },
          { name: '延庆区' },
        ],
      },
    ],
  },
  {
    name: '上海市',
    cities: [
      {
        name: '上海市',
        districts: [
          { name: '黄浦区' },
          { name: '徐汇区' },
          { name: '长宁区' },
          { name: '静安区' },
          { name: '普陀区' },
          { name: '虹口区' },
          { name: '杨浦区' },
          { name: '闵行区' },
          { name: '宝山区' },
          { name: '嘉定区' },
          { name: '浦东新区' },
          { name: '金山区' },
          { name: '松江区' },
          { name: '青浦区' },
          { name: '奉贤区' },
          { name: '崇明区' },
        ],
      },
    ],
  },
  {
    name: '浙江省',
    cities: [
      {
        name: '杭州市',
        districts: [
          { name: '上城区' },
          { name: '拱墅区' },
          { name: '西湖区' },
          { name: '滨江区' },
          { name: '萧山区' },
          { name: '余杭区' },
          { name: '临平区' },
          { name: '钱塘区' },
          { name: '富阳区' },
          { name: '临安区' },
        ],
      },
      {
        name: '宁波市',
        districts: [
          { name: '海曙区' },
          { name: '江北区' },
          { name: '北仑区' },
          { name: '镇海区' },
          { name: '鄞州区' },
          { name: '奉化区' },
          { name: '余姚市' },
          { name: '慈溪市' },
        ],
      },
      {
        name: '温州市',
        districts: [
          { name: '鹿城区' },
          { name: '龙湾区' },
          { name: '瓯海区' },
          { name: '洞头区' },
          { name: '瑞安市' },
          { name: '乐清市' },
        ],
      },
    ],
  },
  {
    name: '江苏省',
    cities: [
      {
        name: '南京市',
        districts: [
          { name: '玄武区' },
          { name: '秦淮区' },
          { name: '建邺区' },
          { name: '鼓楼区' },
          { name: '浦口区' },
          { name: '栖霞区' },
          { name: '雨花台区' },
          { name: '江宁区' },
          { name: '六合区' },
          { name: '溧水区' },
          { name: '高淳区' },
        ],
      },
      {
        name: '苏州市',
        districts: [
          { name: '姑苏区' },
          { name: '虎丘区' },
          { name: '吴中区' },
          { name: '相城区' },
          { name: '吴江区' },
          { name: '昆山市' },
          { name: '常熟市' },
          { name: '张家港市' },
          { name: '太仓市' },
        ],
      },
      {
        name: '无锡市',
        districts: [
          { name: '梁溪区' },
          { name: '锡山区' },
          { name: '惠山区' },
          { name: '滨湖区' },
          { name: '新吴区' },
          { name: '江阴市' },
          { name: '宜兴市' },
        ],
      },
    ],
  },
  {
    name: '四川省',
    cities: [
      {
        name: '成都市',
        districts: [
          { name: '锦江区' },
          { name: '青羊区' },
          { name: '金牛区' },
          { name: '武侯区' },
          { name: '成华区' },
          { name: '龙泉驿区' },
          { name: '青白江区' },
          { name: '新都区' },
          { name: '温江区' },
          { name: '双流区' },
          { name: '郫都区' },
          { name: '新津区' },
        ],
      },
      {
        name: '绵阳市',
        districts: [
          { name: '涪城区' },
          { name: '游仙区' },
          { name: '安州区' },
          { name: '江油市' },
        ],
      },
    ],
  },
  {
    name: '湖北省',
    cities: [
      {
        name: '武汉市',
        districts: [
          { name: '江岸区' },
          { name: '江汉区' },
          { name: '硚口区' },
          { name: '汉阳区' },
          { name: '武昌区' },
          { name: '青山区' },
          { name: '洪山区' },
          { name: '东西湖区' },
          { name: '汉南区' },
          { name: '蔡甸区' },
          { name: '江夏区' },
          { name: '黄陂区' },
          { name: '新洲区' },
        ],
      },
    ],
  },
  {
    name: '湖南省',
    cities: [
      {
        name: '长沙市',
        districts: [
          { name: '芙蓉区' },
          { name: '天心区' },
          { name: '岳麓区' },
          { name: '开福区' },
          { name: '雨花区' },
          { name: '望城区' },
          { name: '长沙县' },
        ],
      },
    ],
  },
  {
    name: '河南省',
    cities: [
      {
        name: '郑州市',
        districts: [
          { name: '中原区' },
          { name: '二七区' },
          { name: '管城回族区' },
          { name: '金水区' },
          { name: '上街区' },
          { name: '惠济区' },
          { name: '郑东新区' },
        ],
      },
    ],
  },
  {
    name: '山东省',
    cities: [
      {
        name: '济南市',
        districts: [
          { name: '历下区' },
          { name: '市中区' },
          { name: '槐荫区' },
          { name: '天桥区' },
          { name: '历城区' },
          { name: '长清区' },
          { name: '章丘区' },
        ],
      },
      {
        name: '青岛市',
        districts: [
          { name: '市南区' },
          { name: '市北区' },
          { name: '黄岛区' },
          { name: '崂山区' },
          { name: '李沧区' },
          { name: '城阳区' },
          { name: '即墨区' },
        ],
      },
    ],
  },
  {
    name: '福建省',
    cities: [
      {
        name: '福州市',
        districts: [
          { name: '鼓楼区' },
          { name: '台江区' },
          { name: '仓山区' },
          { name: '马尾区' },
          { name: '晋安区' },
          { name: '长乐区' },
        ],
      },
      {
        name: '厦门市',
        districts: [
          { name: '思明区' },
          { name: '海沧区' },
          { name: '湖里区' },
          { name: '集美区' },
          { name: '同安区' },
          { name: '翔安区' },
        ],
      },
    ],
  },
  {
    name: '陕西省',
    cities: [
      {
        name: '西安市',
        districts: [
          { name: '新城区' },
          { name: '碑林区' },
          { name: '莲湖区' },
          { name: '灞桥区' },
          { name: '未央区' },
          { name: '雁塔区' },
          { name: '阎良区' },
          { name: '临潼区' },
          { name: '长安区' },
          { name: '高陵区' },
          { name: '鄠邑区' },
        ],
      },
    ],
  },
  {
    name: '重庆市',
    cities: [
      {
        name: '重庆市',
        districts: [
          { name: '渝中区' },
          { name: '江北区' },
          { name: '南岸区' },
          { name: '九龙坡区' },
          { name: '沙坪坝区' },
          { name: '大渡口区' },
          { name: '渝北区' },
          { name: '巴南区' },
          { name: '北碚区' },
          { name: '綦江区' },
          { name: '大足区' },
          { name: '璧山区' },
          { name: '铜梁区' },
          { name: '潼南区' },
          { name: '荣昌区' },
          { name: '合川区' },
          { name: '永川区' },
          { name: '江津区' },
        ],
      },
    ],
  },
  {
    name: '天津市',
    cities: [
      {
        name: '天津市',
        districts: [
          { name: '和平区' },
          { name: '河东区' },
          { name: '河西区' },
          { name: '南开区' },
          { name: '河北区' },
          { name: '红桥区' },
          { name: '东丽区' },
          { name: '西青区' },
          { name: '津南区' },
          { name: '北辰区' },
          { name: '武清区' },
          { name: '宝坻区' },
          { name: '滨海新区' },
          { name: '宁河区' },
          { name: '静海区' },
          { name: '蓟州区' },
        ],
      },
    ],
  },
  {
    name: '河北省',
    cities: [
      {
        name: '石家庄市',
        districts: [
          { name: '长安区' },
          { name: '桥西区' },
          { name: '新华区' },
          { name: '井陉矿区' },
          { name: '裕华区' },
          { name: '藁城区' },
          { name: '鹿泉区' },
          { name: '栾城区' },
        ],
      },
      {
        name: '唐山市',
        districts: [
          { name: '路南区' },
          { name: '路北区' },
          { name: '古冶区' },
          { name: '开平区' },
          { name: '丰南区' },
          { name: '丰润区' },
          { name: '曹妃甸区' },
        ],
      },
      {
        name: '秦皇岛市',
        districts: [
          { name: '海港区' },
          { name: '山海关区' },
          { name: '北戴河区' },
          { name: '抚宁区' },
        ],
      },
      {
        name: '保定市',
        districts: [
          { name: '竞秀区' },
          { name: '莲池区' },
          { name: '满城区' },
          { name: '清苑区' },
          { name: '徐水区' },
        ],
      },
    ],
  },
  {
    name: '山西省',
    cities: [
      {
        name: '太原市',
        districts: [
          { name: '小店区' },
          { name: '迎泽区' },
          { name: '杏花岭区' },
          { name: '尖草坪区' },
          { name: '万柏林区' },
          { name: '晋源区' },
        ],
      },
      {
        name: '大同市',
        districts: [
          { name: '平城区' },
          { name: '云冈区' },
          { name: '云州区' },
          { name: '新荣区' },
        ],
      },
    ],
  },
  {
    name: '内蒙古自治区',
    cities: [
      {
        name: '呼和浩特市',
        districts: [
          { name: '新城区' },
          { name: '回民区' },
          { name: '玉泉区' },
          { name: '赛罕区' },
          { name: '土默特左旗' },
        ],
      },
      {
        name: '包头市',
        districts: [
          { name: '东河区' },
          { name: '昆都仑区' },
          { name: '青山区' },
          { name: '石拐区' },
          { name: '九原区' },
        ],
      },
    ],
  },
  {
    name: '辽宁省',
    cities: [
      {
        name: '沈阳市',
        districts: [
          { name: '和平区' },
          { name: '沈河区' },
          { name: '大东区' },
          { name: '皇姑区' },
          { name: '铁西区' },
          { name: '苏家屯区' },
          { name: '浑南区' },
          { name: '沈北新区' },
          { name: '于洪区' },
        ],
      },
      {
        name: '大连市',
        districts: [
          { name: '中山区' },
          { name: '西岗区' },
          { name: '沙河口区' },
          { name: '甘井子区' },
          { name: '旅顺口区' },
          { name: '金州区' },
          { name: '普兰店区' },
        ],
      },
    ],
  },
  {
    name: '吉林省',
    cities: [
      {
        name: '长春市',
        districts: [
          { name: '南关区' },
          { name: '宽城区' },
          { name: '朝阳区' },
          { name: '二道区' },
          { name: '绿园区' },
          { name: '双阳区' },
          { name: '九台区' },
        ],
      },
      {
        name: '吉林市',
        districts: [
          { name: '昌邑区' },
          { name: '龙潭区' },
          { name: '船营区' },
          { name: '丰满区' },
        ],
      },
    ],
  },
  {
    name: '黑龙江省',
    cities: [
      {
        name: '哈尔滨市',
        districts: [
          { name: '道里区' },
          { name: '南岗区' },
          { name: '道外区' },
          { name: '平房区' },
          { name: '松北区' },
          { name: '香坊区' },
          { name: '呼兰区' },
          { name: '阿城区' },
          { name: '双城区' },
        ],
      },
      {
        name: '齐齐哈尔市',
        districts: [
          { name: '龙沙区' },
          { name: '建华区' },
          { name: '铁锋区' },
          { name: '昂昂溪区' },
          { name: '富拉尔基区' },
        ],
      },
    ],
  },
  {
    name: '江西省',
    cities: [
      {
        name: '南昌市',
        districts: [
          { name: '东湖区' },
          { name: '西湖区' },
          { name: '青云谱区' },
          { name: '青山湖区' },
          { name: '新建区' },
          { name: '红谷滩区' },
        ],
      },
      {
        name: '赣州市',
        districts: [
          { name: '章贡区' },
          { name: '南康区' },
          { name: '赣县区' },
        ],
      },
    ],
  },
  {
    name: '安徽省',
    cities: [
      {
        name: '合肥市',
        districts: [
          { name: '瑶海区' },
          { name: '庐阳区' },
          { name: '蜀山区' },
          { name: '包河区' },
          { name: '长丰县' },
          { name: '肥东县' },
          { name: '肥西县' },
        ],
      },
      {
        name: '芜湖市',
        districts: [
          { name: '镜湖区' },
          { name: '弋江区' },
          { name: '鸠江区' },
          { name: '三山区' },
        ],
      },
    ],
  },
  {
    name: '广西壮族自治区',
    cities: [
      {
        name: '南宁市',
        districts: [
          { name: '兴宁区' },
          { name: '青秀区' },
          { name: '江南区' },
          { name: '西乡塘区' },
          { name: '良庆区' },
          { name: '邕宁区' },
          { name: '武鸣区' },
        ],
      },
      {
        name: '柳州市',
        districts: [
          { name: '城中区' },
          { name: '鱼峰区' },
          { name: '柳南区' },
          { name: '柳北区' },
          { name: '柳江区' },
        ],
      },
      {
        name: '桂林市',
        districts: [
          { name: '秀峰区' },
          { name: '叠彩区' },
          { name: '象山区' },
          { name: '七星区' },
          { name: '雁山区' },
          { name: '临桂区' },
        ],
      },
    ],
  },
  {
    name: '海南省',
    cities: [
      {
        name: '海口市',
        districts: [
          { name: '秀英区' },
          { name: '龙华区' },
          { name: '琼山区' },
          { name: '美兰区' },
        ],
      },
      {
        name: '三亚市',
        districts: [
          { name: '海棠区' },
          { name: '吉阳区' },
          { name: '天涯区' },
          { name: '崖州区' },
        ],
      },
    ],
  },
  {
    name: '贵州省',
    cities: [
      {
        name: '贵阳市',
        districts: [
          { name: '南明区' },
          { name: '云岩区' },
          { name: '花溪区' },
          { name: '乌当区' },
          { name: '白云区' },
          { name: '观山湖区' },
        ],
      },
      {
        name: '遵义市',
        districts: [
          { name: '红花岗区' },
          { name: '汇川区' },
          { name: '播州区' },
        ],
      },
    ],
  },
  {
    name: '云南省',
    cities: [
      {
        name: '昆明市',
        districts: [
          { name: '五华区' },
          { name: '盘龙区' },
          { name: '官渡区' },
          { name: '西山区' },
          { name: '东川区' },
          { name: '呈贡区' },
          { name: '晋宁区' },
        ],
      },
      {
        name: '大理白族自治州',
        districts: [
          { name: '大理市' },
          { name: '祥云县' },
          { name: '宾川县' },
        ],
      },
    ],
  },
  {
    name: '西藏自治区',
    cities: [
      {
        name: '拉萨市',
        districts: [
          { name: '城关区' },
          { name: '堆龙德庆区' },
          { name: '达孜区' },
        ],
      },
    ],
  },
  {
    name: '甘肃省',
    cities: [
      {
        name: '兰州市',
        districts: [
          { name: '城关区' },
          { name: '七里河区' },
          { name: '西固区' },
          { name: '安宁区' },
          { name: '红古区' },
        ],
      },
    ],
  },
  {
    name: '青海省',
    cities: [
      {
        name: '西宁市',
        districts: [
          { name: '城东区' },
          { name: '城中区' },
          { name: '城西区' },
          { name: '城北区' },
          { name: '湟中区' },
        ],
      },
    ],
  },
  {
    name: '宁夏回族自治区',
    cities: [
      {
        name: '银川市',
        districts: [
          { name: '兴庆区' },
          { name: '西夏区' },
          { name: '金凤区' },
        ],
      },
    ],
  },
  {
    name: '新疆维吾尔自治区',
    cities: [
      {
        name: '乌鲁木齐市',
        districts: [
          { name: '天山区' },
          { name: '沙依巴克区' },
          { name: '新市区' },
          { name: '水磨沟区' },
          { name: '头屯河区' },
          { name: '达坂城区' },
          { name: '米东区' },
        ],
      },
    ],
  },
  {
    name: '香港特别行政区',
    cities: [
      {
        name: '香港',
        districts: [
          { name: '中西区' },
          { name: '湾仔区' },
          { name: '东区' },
          { name: '南区' },
          { name: '油尖旺区' },
          { name: '深水埗区' },
          { name: '九龙城区' },
          { name: '黄大仙区' },
          { name: '观塘区' },
        ],
      },
    ],
  },
  {
    name: '澳门特别行政区',
    cities: [
      {
        name: '澳门',
        districts: [
          { name: '澳门半岛' },
          { name: '氹仔' },
          { name: '路环' },
        ],
      },
    ],
  },
  {
    name: '台湾省',
    cities: [
      {
        name: '台北市',
        districts: [
          { name: '中正区' },
          { name: '大同区' },
          { name: '中山区' },
          { name: '松山区' },
          { name: '大安区' },
          { name: '万华区' },
          { name: '信义区' },
          { name: '士林区' },
          { name: '北投区' },
          { name: '内湖区' },
          { name: '南港区' },
          { name: '文山区' },
        ],
      },
    ],
  },
];
