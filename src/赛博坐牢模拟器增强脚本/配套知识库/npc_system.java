// ==UserScript==
// @name         赛博坐牢模拟器-NPC系统
// @namespace    detention.system.npc
// @version      3.3.0
// @description  整合的NPC生成系统(遵循新事件逻辑)
// @author       Detention System Team
// @match        *
// @grant        none
// @require      core.js
// ==/UserScript==

(function() {
    'use strict';

    console.log('[NPC系统] 开始加载...');

    const DS = window.detentionSystem;
    if (!DS) {
        console.error('[NPC系统] 核心系统未加载');
        return;
    }

    // ========== 姓名生成器 ==========
    const NameGenerator = {
        surnames: {
            tier1: {
                names: ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周'],
                weight: 35
            },
            tier2: {
                names: ['徐', '孙', '马', '朱', '胡', '郭', '何', '林', '高', '罗', '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹'],
                weight: 30
            },
            tier3: {
                names: ['彭', '曾', '肖', '田', '董', '袁', '潘', '于', '蒋', '蔡', '余', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈', '姚', '卢', '姜', '崔', '钟', '谭', '陆', '汪', '范', '金'],
                weight: 20
            },
            tier4: {
                names: ['石', '廖', '贾', '夏', '韦', '付', '方', '白', '邹', '孟', '熊', '秦', '邱', '江', '尹', '薛', '闫', '段', '雷', '侯', '龙', '史', '陶', '黎', '贺', '顾', '毛', '郝', '龚', '邵'],
                weight: 10
            },
            tier5: {
                names: ['万', '覃', '武', '乔', '严', '赖', '文', '洪', '季', '莫', '欧阳', '司马', '上官', '诸葛', '东方'],
                weight: 5
            }
        },

        givenNames: {
            vintage: {
                single: ['芳', '丽', '娟', '英', '华', '玉', '秀', '珍', '红', '梅', '兰', '霞', '燕', '萍', '静'],
                double: [
                    ['秀', '英'], ['秀', '兰'], ['秀', '珍'], ['秀', '芳'],
                    ['丽', '华'], ['丽', '娟'], ['丽', '萍'], ['丽', '芳'],
                    ['玉', '兰'], ['玉', '梅'], ['玉', '华'], ['玉', '珍'],
                    ['春', '梅'], ['春', '兰'], ['春', '华'], ['春', '燕'],
                    ['小', '红'], ['小', '芳'], ['小', '丽'], ['小', '燕']
                ],
                weight: 25
            },
            classic: {
                single: ['婷', '洁', '莉', '敏', '艳', '娜', '倩', '雪', '琳', '颖', '晶', '欣', '慧', '佳', '薇'],
                double: [
                    ['雅', '婷'], ['雅', '洁'], ['雅', '琳'], ['雅', '欣'],
                    ['晓', '燕'], ['晓', '丽'], ['晓', '红'], ['晓', '霞'],
                    ['文', '静'], ['文', '慧'], ['文', '娟'], ['文', '婷'],
                    ['志', '红'], ['志', '华'], ['志', '英'], ['志', '芳'],
                    ['海', '燕'], ['海', '霞'], ['海', '英'], ['海', '丽']
                ],
                weight: 35
            },
            modern: {
                single: ['婷', '洁', '莉', '敏', '艳', '娜', '倩', '雪', '琳', '颖', '晶', '欣', '慧', '佳', '薇', '涵', '萱', '琪', '瑶', '诗'],
                double: [
                    ['雨', '婷'], ['雨', '欣'], ['雨', '涵'], ['雨', '萱'],
                    ['思', '琪'], ['思', '涵'], ['思', '雨'], ['思', '颖'],
                    ['梦', '琪'], ['梦', '瑶'], ['梦', '涵'], ['梦', '萱'],
                    ['诗', '涵'], ['诗', '琪'], ['诗', '雨'], ['诗', '婷'],
                    ['欣', '怡'], ['欣', '悦'], ['欣', '然'], ['欣', '妍']
                ],
                weight: 30
            },
            contemporary: {
                single: ['涵', '萱', '琪', '瑶', '诗', '语', '馨', '妍', '彤', '悦', '然', '怡', '可', '依', '梓'],
                double: [
                    ['梓', '涵'], ['梓', '萱'], ['梓', '琪'], ['梓', '瑶'],
                    ['子', '涵'], ['子', '萱'], ['子', '琪'], ['子', '瑶'],
                    ['雨', '桐'], ['雨', '彤'], ['雨', '馨'], ['雨', '诺'],
                    ['诗', '语'], ['诗', '涵'], ['诗', '雨'], ['诗', '琪'],
                    ['可', '欣'], ['可', '馨'], ['可', '心'], ['可', '儿']
                ],
                weight: 10
            }
        },

        badNames: [
            '史珍香', '范统', '杜子腾', '范剑', '朱逸群', '秦寿生',
            '杜琦燕', '魏生津', '费彦', '殷静', '范婉', '胡丽晶'
        ],

        badChars: ['屎', '尿', '粪', '死', '丧', '病', '残', '废', '贱', '奴', '妓', '娼'],

        generate(birthYear) {
            let attempts = 0;
            const maxAttempts = 50;

            while (attempts < maxAttempts) {
                attempts++;

                // 选择姓氏
                const surname = this.selectSurname();

                // 根据出生年份选择名字风格
                const givenName = this.selectGivenName(birthYear);

                const fullName = surname + givenName;

                // 检查是否为不良名字
                if (this.isValidName(fullName)) {
                    return fullName;
                }
            }

            // 如果50次都失败，返回默认名字
            return '张' + this.givenNames.classic.single[0];
        },

        selectSurname() {
            const tiers = Object.values(this.surnames);
            const totalWeight = tiers.reduce((sum, tier) => sum + tier.weight, 0);
            let random = Math.random() * totalWeight;

            for (let tier of tiers) {
                random -= tier.weight;
                if (random <= 0) {
                    return tier.names[Math.floor(Math.random() * tier.names.length)];
                }
            }

            return this.surnames.tier1.names[0];
        },

        selectGivenName(birthYear) {
            const currentYear = new Date().getFullYear();
            const age = currentYear - birthYear;

            let style;
            if (age >= 50) {
                style = 'vintage';
            } else if (age >= 35) {
                style = 'classic';
            } else if (age >= 20) {
                style = 'modern';
            } else {
                style = 'contemporary';
            }

            const styleData = this.givenNames[style];
            const useDouble = Math.random() < 0.6; // 60%概率使用双字名

            if (useDouble && styleData.double.length > 0) {
                const pair = styleData.double[Math.floor(Math.random() * styleData.double.length)];
                return pair[0] + pair[1];
            } else {
                return styleData.single[Math.floor(Math.random() * styleData.single.length)];
            }
        },

        isValidName(name) {
            // 检查是否在黑名单中
            if (this.badNames.includes(name)) {
                return false;
            }

            // 检查是否包含不良字符
            for (let char of this.badChars) {
                if (name.includes(char)) {
                    return false;
                }
            }

            return true;
        }
    };

    // ========== 罪名生成器 ==========
    const CrimeGenerator = {
        crimes: {
            violent: {
                names: ['故意杀人', '故意伤害', '强奸', '抢劫', '绑架', '放火', '爆炸', '投放危险物质'],
                weight: 15,
                sentenceRange: [3, 20] // 年
            },
            property: {
                names: ['盗窃', '诈骗', '抢夺', '敲诈勒索', '职务侵占', '挪用资金', '贪污', '受贿'],
                weight: 35,
                sentenceRange: [1, 15]
            },
            drug: {
                names: ['贩卖毒品', '运输毒品', '制造毒品', '非法持有毒品', '容留他人吸毒', '引诱他人吸毒'],
                weight: 20,
                sentenceRange: [3, 15]
            },
            economic: {
                names: ['非法吸收公众存款', '集资诈骗', '合同诈骗', '信用卡诈骗', '洗钱', '虚开发票', '逃税'],
                weight: 15,
                sentenceRange: [2, 10]
            },
            social: {
                names: ['寻衅滋事', '聚众斗殴', '开设赌场', '组织卖淫', '传播淫秽物品', '非法拘禁', '妨害公务'],
                weight: 10,
                sentenceRange: [1, 7]
            },
            other: {
                names: ['交通肇事', '危险驾驶', '生产销售伪劣产品', '非法经营', '污染环境', '走私'],
                weight: 5,
                sentenceRange: [1, 5]
            }
        },

        generate() {
            const categories = Object.values(this.crimes);
            const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
            let random = Math.random() * totalWeight;

            for (let category of categories) {
                random -= category.weight;
                if (random <= 0) {
                    const crime = category.names[Math.floor(Math.random() * category.names.length)];
                    const sentence = this.generateSentence(category.sentenceRange);
                    return { crime, sentence, category: category };
                }
            }

            return { crime: '盗窃', sentence: 3, category: this.crimes.property };
        },

        generateSentence(range) {
            const [min, max] = range;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    };

    // ========== NPC生成器 ==========
    const NPCGenerator = {
        npcDatabase: [],
        currentCellNPCs: [],

        // ========== 生成NPC ==========
        generate(count = 1, context = {}) {
            const npcs = [];

            for (let i = 0; i < count; i++) {
                const npc = this.generateSingle(context);
                npcs.push(npc);
                this.npcDatabase.push(npc);
            }

            return npcs;
        },

        // ========== 生成单个NPC ==========
        generateSingle(context = {}) {
            // 获取当前阶段信息
            const eventSystem = DS.getModule('eventSystem');
            const stageInfo = eventSystem ? eventSystem.getCurrentStageInfo() : {};

            // 年龄分布
            const age = this.generateAge();
            const birthYear = new Date().getFullYear() - age;

            // 生成姓名
            const name = NameGenerator.generate(birthYear);

            // 生成罪名
            const crimeData = CrimeGenerator.generate();

            // 生成外貌
            const appearance = this.generateAppearance(age);

            // 生成性格
            const personality = this.generatePersonality();

            // 生成背景故事
            const background = this.generateBackground(age, crimeData);

            // 生成关系倾向
            const relationship = this.generateRelationship();

            // 根据监室类型调整NPC特征
            const cellType = stageInfo.cellType || 'transition';
            this.adjustByCellType(personality, relationship, cellType);

            const npc = {
                id: this.generateId(),
                name: name,
                age: age,
                crime: crimeData.crime,
                sentence: crimeData.sentence,
                appearance: appearance,
                personality: personality,
                background: background,
                relationship: relationship,
                cellType: cellType,
                daysInCustody: Math.floor(Math.random() * 365) + 30,
                status: 'active',
                createdAt: Date.now()
            };

            return npc;
        },

        // ========== 生成年龄 ==========
        generateAge() {
            const random = Math.random();
            
            if (random < 0.05) return Math.floor(Math.random() * 3) + 18; // 18-20岁 5%
            if (random < 0.25) return Math.floor(Math.random() * 10) + 21; // 21-30岁 20%
            if (random < 0.55) return Math.floor(Math.random() * 10) + 31; // 31-40岁 30%
            if (random < 0.80) return Math.floor(Math.random() * 10) + 41; // 41-50岁 25%
            if (random < 0.95) return Math.floor(Math.random() * 10) + 51; // 51-60岁 15%
            return Math.floor(Math.random() * 15) + 61; // 61-75岁 5%
        },

        // ========== 生成外貌 ==========
        generateAppearance(age) {
            const heights = [150, 155, 160, 165, 170, 175];
            const weights = [45, 50, 55, 60, 65, 70, 75, 80];
            
            const height = heights[Math.floor(Math.random() * heights.length)];
            const weight = weights[Math.floor(Math.random() * weights.length)];

            const hairStyles = age > 50 
                ? ['短发', '花白短发', '灰白短发', '稀疏短发']
                : ['长发', '短发', '马尾', '齐肩发', '波浪卷'];

            const skinTones = ['白皙', '偏白', '自然', '偏黑', '黝黑'];
            const features = ['清秀', '普通', '憔悴', '粗犷', '精致', '沧桑'];

            return {
                height: height,
                weight: weight,
                hair: hairStyles[Math.floor(Math.random() * hairStyles.length)],
                eyes: '黑色',
                skin: skinTones[Math.floor(Math.random() * skinTones.length)],
                features: features[Math.floor(Math.random() * features.length)]
            };
        },

        // ========== 生成性格 ==========
        generatePersonality() {
            const traits = {
                aggression: Math.floor(Math.random() * 100), // 攻击性
                sociability: Math.floor(Math.random() * 100), // 社交性
                intelligence: Math.floor(Math.random() * 100), // 智力
                emotional: Math.floor(Math.random() * 100), // 情绪化
                dominance: Math.floor(Math.random() * 100), // 支配欲
                kindness: Math.floor(Math.random() * 100) // 善良度
            };

            // 生成性格标签
            const tags = [];
            if (traits.aggression > 70) tags.push('暴力倾向');
            if (traits.sociability > 70) tags.push('善于交际');
            if (traits.intelligence > 70) tags.push('聪明');
            if (traits.emotional > 70) tags.push('情绪化');
            if (traits.dominance > 70) tags.push('强势');
            if (traits.kindness > 70) tags.push('善良');

            if (traits.aggression < 30) tags.push('温和');
            if (traits.sociability < 30) tags.push('孤僻');
            if (traits.emotional < 30) tags.push('冷静');
            if (traits.dominance < 30) tags.push('顺从');

            return {
                traits: traits,
                tags: tags
            };
        },

        // ========== 生成背景故事 ==========
        generateBackground(age, crimeData) {
            const educations = ['小学', '初中', '高中', '中专', '大专', '本科', '研究生'];
            const educationWeights = [10, 25, 30, 15, 10, 8, 2];
            const educationIndex = this.weightedRandom(educations.length, educationWeights);

            const maritalStatuses = ['未婚', '已婚', '离异', '丧偶'];
            const maritalWeights = age < 25 ? [80, 15, 5, 0] : 
                                   age < 40 ? [20, 60, 15, 5] :
                                   [10, 50, 30, 10];
            const maritalIndex = this.weightedRandom(maritalStatuses.length, maritalWeights);

            const hasChildren = maritalStatuses[maritalIndex] !== '未婚' && Math.random() < 0.7;
            const childrenCount = hasChildren ? Math.floor(Math.random() * 3) + 1 : 0;

            return {
                education: educations[educationIndex],
                maritalStatus: maritalStatuses[maritalIndex],
                hasChildren: hasChildren,
                childrenCount: childrenCount,
                hometown: this.generateHometown(),
                priorConvictions: Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0
            };
        },

        // ========== 生成籍贯 ==========
        generateHometown() {
            const provinces = [
                '河南', '山东', '四川', '广东', '江苏', '河北', '湖南', '安徽', '湖北', '浙江',
                '广西', '云南', '江西', '辽宁', '黑龙江', '陕西', '福建', '山西', '贵州', '重庆'
            ];
            return provinces[Math.floor(Math.random() * provinces.length)];
        },

        // ========== 生成关系倾向 ==========
        generateRelationship() {
            return {
                toProtagonist: 50, // 对主角的好感度 0-100
                faction: null, // 所属派系
                allies: [], // 盟友
                enemies: [], // 敌人
                influence: Math.floor(Math.random() * 100) // 影响力
            };
        },

        // ========== 根据监室类型调整 ==========
        adjustByCellType(personality, relationship, cellType) {
            if (cellType === 'transition') {
                // 过渡监室：新人较多，不确定性高
                personality.traits.emotional += 10;
                relationship.influence -= 20;
            } else if (cellType === 'pretrial') {
                // 未决犯监室：等待审判，焦虑
                personality.traits.emotional += 15;
                personality.traits.aggression += 5;
            } else if (cellType === 'convicted') {
                // 已决犯监室：已判刑，相对稳定但绝望
                personality.traits.emotional -= 10;
                personality.traits.aggression += 10;
                relationship.influence += 10;
            }

            // 限制范围
            for (let key in personality.traits) {
                personality.traits[key] = Math.max(0, Math.min(100, personality.traits[key]));
            }
            relationship.influence = Math.max(0, Math.min(100, relationship.influence));
        },

        // ========== 加权随机 ==========
        weightedRandom(count, weights) {
            const totalWeight = weights.reduce((sum, w) => sum + w, 0);
            let random = Math.random() * totalWeight;

            for (let i = 0; i < count; i++) {
                random -= weights[i];
                if (random <= 0) {
                    return i;
                }
            }

            return count - 1;
        },

        // ========== 生成ID ==========
        generateId() {
            return 'npc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        // ========== 根据事件生成特定NPC ==========
        generateForEvent(eventType) {
            const context = { eventType: eventType };

            // 根据事件类型调整NPC特征
            if (eventType === 'interrogation') {
                // 提审：生成警察
                return this.generatePolice();
            } else if (eventType === 'lawyer_visit') {
                // 律师会见：生成律师
                return this.generateLawyer();
            } else if (eventType === 'family_visit') {
                // 家属探视：生成家属
                                return this.generateFamily();
            } else if (eventType === 'medical_visit') {
                // 外出就医：生成医生
                return this.generateDoctor();
            } else if (eventType === 'scene_identification') {
                // 指认现场：生成警察和围观群众
                return {
                    police: this.generatePolice(),
                    witnesses: this.generate(2, { type: 'witness' })
                };
            } else {
                // 默认生成普通狱友
                return this.generateSingle(context);
            }
        },

        // ========== 生成警察 ==========
        generatePolice() {
            const age = Math.floor(Math.random() * 20) + 25; // 25-45岁
            const birthYear = new Date().getFullYear() - age;
            const name = NameGenerator.generate(birthYear);

            const ranks = ['民警', '警长', '副队长', '队长'];
            const rank = ranks[Math.floor(Math.random() * ranks.length)];

            return {
                id: this.generateId(),
                name: name,
                age: age,
                role: 'police',
                rank: rank,
                appearance: this.generateAppearance(age),
                personality: {
                    traits: {
                        aggression: Math.floor(Math.random() * 30) + 40, // 40-70
                        sociability: Math.floor(Math.random() * 40) + 30, // 30-70
                        intelligence: Math.floor(Math.random() * 30) + 50, // 50-80
                        emotional: Math.floor(Math.random() * 40) + 20, // 20-60
                        dominance: Math.floor(Math.random() * 30) + 60, // 60-90
                        kindness: Math.floor(Math.random() * 60) + 20 // 20-80
                    },
                    tags: ['严肃', '专业']
                },
                attitude: Math.floor(Math.random() * 40) + 30, // 对嫌疑人的态度 30-70
                createdAt: Date.now()
            };
        },

        // ========== 生成律师 ==========
        generateLawyer() {
            const age = Math.floor(Math.random() * 25) + 28; // 28-53岁
            const birthYear = new Date().getFullYear() - age;
            const name = NameGenerator.generate(birthYear);

            const types = ['法律援助律师', '私人律师', '知名律师'];
            const typeWeights = [50, 40, 10];
            const typeIndex = this.weightedRandom(types.length, typeWeights);

            return {
                id: this.generateId(),
                name: name,
                age: age,
                role: 'lawyer',
                type: types[typeIndex],
                appearance: this.generateAppearance(age),
                personality: {
                    traits: {
                        aggression: Math.floor(Math.random() * 20) + 20, // 20-40
                        sociability: Math.floor(Math.random() * 30) + 60, // 60-90
                        intelligence: Math.floor(Math.random() * 20) + 70, // 70-90
                        emotional: Math.floor(Math.random() * 40) + 30, // 30-70
                        dominance: Math.floor(Math.random() * 40) + 40, // 40-80
                        kindness: Math.floor(Math.random() * 40) + 40 // 40-80
                    },
                    tags: ['专业', '理性']
                },
                experience: Math.floor(Math.random() * 20) + 5, // 5-25年经验
                successRate: Math.floor(Math.random() * 40) + 40, // 40-80%胜诉率
                createdAt: Date.now()
            };
        },

        // ========== 生成家属 ==========
        generateFamily() {
            const relationships = ['母亲', '父亲', '丈夫', '妻子', '姐姐', '妹妹', '女儿', '儿子'];
            const weights = [30, 20, 15, 10, 10, 10, 3, 2];
            const relationIndex = this.weightedRandom(relationships.length, weights);
            const relation = relationships[relationIndex];

            // 根据关系确定年龄
            let age;
            if (relation === '母亲' || relation === '父亲') {
                age = Math.floor(Math.random() * 20) + 45; // 45-65岁
            } else if (relation === '女儿' || relation === '儿子') {
                age = Math.floor(Math.random() * 15) + 5; // 5-20岁
            } else {
                age = Math.floor(Math.random() * 30) + 25; // 25-55岁
            }

            const birthYear = new Date().getFullYear() - age;
            const name = NameGenerator.generate(birthYear);

            return {
                id: this.generateId(),
                name: name,
                age: age,
                role: 'family',
                relation: relation,
                appearance: this.generateAppearance(age),
                personality: {
                    traits: {
                        aggression: Math.floor(Math.random() * 30) + 10, // 10-40
                        sociability: Math.floor(Math.random() * 50) + 30, // 30-80
                        intelligence: Math.floor(Math.random() * 60) + 30, // 30-90
                        emotional: Math.floor(Math.random() * 50) + 40, // 40-90
                        dominance: Math.floor(Math.random() * 50) + 20, // 20-70
                        kindness: Math.floor(Math.random() * 30) + 60 // 60-90
                    },
                    tags: ['关心', '担忧']
                },
                supportLevel: Math.floor(Math.random() * 40) + 60, // 60-100支持度
                createdAt: Date.now()
            };
        },

        // ========== 生成医生 ==========
        generateDoctor() {
            const age = Math.floor(Math.random() * 25) + 30; // 30-55岁
            const birthYear = new Date().getFullYear() - age;
            const name = NameGenerator.generate(birthYear);

            const specialties = ['内科', '外科', '精神科', '妇科', '急诊科'];
            const specialty = specialties[Math.floor(Math.random() * specialties.length)];

            return {
                id: this.generateId(),
                name: name,
                age: age,
                role: 'doctor',
                specialty: specialty,
                appearance: this.generateAppearance(age),
                personality: {
                    traits: {
                        aggression: Math.floor(Math.random() * 20) + 10, // 10-30
                        sociability: Math.floor(Math.random() * 40) + 40, // 40-80
                        intelligence: Math.floor(Math.random() * 20) + 70, // 70-90
                        emotional: Math.floor(Math.random() * 40) + 30, // 30-70
                        dominance: Math.floor(Math.random() * 40) + 40, // 40-80
                        kindness: Math.floor(Math.random() * 30) + 60 // 60-90
                    },
                    tags: ['专业', '冷静']
                },
                experience: Math.floor(Math.random() * 25) + 5, // 5-30年经验
                createdAt: Date.now()
            };
        },

        // ========== 获取当前监室NPC ==========
        getCurrentCellNPCs() {
            return this.currentCellNPCs;
        },

        // ========== 设置当前监室NPC ==========
        setCurrentCellNPCs(npcs) {
            this.currentCellNPCs = npcs;
            DS.events.emit('cell_npcs_changed', { npcs: npcs });
        },

        // ========== 添加NPC到当前监室 ==========
        addNPCToCell(npc) {
            this.currentCellNPCs.push(npc);
            DS.events.emit('npc_joined_cell', { npc: npc });
        },

        // ========== 从监室移除NPC ==========
        removeNPCFromCell(npcId) {
            const index = this.currentCellNPCs.findIndex(n => n.id === npcId);
            if (index !== -1) {
                const npc = this.currentCellNPCs.splice(index, 1)[0];
                DS.events.emit('npc_left_cell', { npc: npc });
                return npc;
            }
            return null;
        },

        // ========== 根据ID查找NPC ==========
        findNPCById(npcId) {
            return this.npcDatabase.find(n => n.id === npcId) || 
                   this.currentCellNPCs.find(n => n.id === npcId);
        },

        // ========== 更新NPC关系 ==========
        updateRelationship(npcId, delta) {
            const npc = this.findNPCById(npcId);
            if (npc && npc.relationship) {
                npc.relationship.toProtagonist = Math.max(0, Math.min(100, 
                    npc.relationship.toProtagonist + delta));
                
                DS.events.emit('relationship_changed', {
                    npcId: npcId,
                    npcName: npc.name,
                    value: npc.relationship.toProtagonist,
                    delta: delta
                });
            }
        },

        // ========== 导出NPC数据 ==========
        exportData() {
            return {
                database: this.npcDatabase,
                currentCell: this.currentCellNPCs
            };
        },

        // ========== 导入NPC数据 ==========
        importData(data) {
            if (!data) return false;

            try {
                this.npcDatabase = data.database || [];
                this.currentCellNPCs = data.currentCell || [];
                console.log('[NPC系统] 数据导入成功');
                return true;
            } catch (error) {
                console.error('[NPC系统] 数据导入失败:', error);
                return false;
            }
        },

        // ========== 清空数据 ==========
        clearData() {
            this.npcDatabase = [];
            this.currentCellNPCs = [];
            console.log('[NPC系统] 数据已清空');
        }
    };

    // ========== 注册到核心系统 ==========
    DS.generateNPC = (count, context) => NPCGenerator.generate(count, context);
    DS.generateNPCForEvent = (eventType) => NPCGenerator.generateForEvent(eventType);
    DS.getCurrentCellNPCs = () => NPCGenerator.getCurrentCellNPCs();
    DS.setCurrentCellNPCs = (npcs) => NPCGenerator.setCurrentCellNPCs(npcs);
    DS.addNPCToCell = (npc) => NPCGenerator.addNPCToCell(npc);
    DS.removeNPCFromCell = (npcId) => NPCGenerator.removeNPCFromCell(npcId);
    DS.findNPC = (npcId) => NPCGenerator.findNPCById(npcId);
    DS.updateNPCRelationship = (npcId, delta) => NPCGenerator.updateRelationship(npcId, delta);
    DS.exportNPCData = () => NPCGenerator.exportData();
    DS.importNPCData = (data) => NPCGenerator.importData(data);

    DS.registerModule('npcSystem', NPCGenerator);

    // ========== 监听事件系统 ==========
    DS.events.on('event_triggered', (event) => {
        // 根据事件类型自动生成相关NPC
        if (['interrogation', 'lawyer_visit', 'family_visit', 'medical_visit', 'scene_identification'].includes(event.id)) {
            const npc = NPCGenerator.generateForEvent(event.id);
            DS.events.emit('event_npc_generated', {
                event: event,
                npc: npc
            });
        }
    });

    // ========== 监听监室转移 ==========
    DS.events.on('cell_transfer', (data) => {
        // 监室转移时，清空当前监室NPC，生成新的
        const newCellType = data.to;
        const npcCount = Math.floor(Math.random() * 5) + 3; // 3-7个NPC
        
        const newNPCs = NPCGenerator.generate(npcCount, { cellType: newCellType });
        NPCGenerator.setCurrentCellNPCs(newNPCs);
        
        console.log(`[NPC系统] 监室转移，生成${npcCount}个新NPC`);
    });

    console.log('[NPC系统] 脚本加载完成');
})();

