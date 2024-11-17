const data = [
    {
        name: "Финансовый аналитик",
        mainSkills: ["Excel", "SQL", "VBA", "1С"],
        otherSkills: ["Power BI", "Python"],
    },
    {
        name: "Предприниматель",
        mainSkills: ["1C", "Excel", "Power BI"],
        otherSkills: [
            "Google Analytics",
            "Яндекс.Метрика",
            "Python",
            "SQL",
            "Tilda",
        ],
    },
    {
        name: "Продуктовый дизайнер",
        mainSkills: [
            "Figma",
            "Sketch",
            "Illustrator",
            "Photoshop",
            "Principle",
            "Tilda",
        ],
        otherSkills: ["Shopify", "Protopie", "Cinema 4D"],
    },
    {
        name: "Менеджер проекта",
        mainSkills: [
            "Visio",
            "1C",
            "Google Analytics",
            "Яндекс.Метрика",
            "Python",
            "SQL",
            "Tilda",
        ],
        otherSkills: ["Figma", "Sketch", "Shopify"],
    },
    {
        name: "Финансовый менеджер",
        mainSkills: ["1C", "Excel", "Power BI"],
        otherSkills: ["BPMN"],
    },
    {
        name: "Руководитель финансового департамента компании",
        mainSkills: ["Sketch", "Figma"],
        otherSkills: ["Shopify", "HQL"],
    },

    {
        name: "Продуктовый аналитик",
        mainSkills: [
            "Google Analytics",
            "Яндекс.Метрика",
            "SQL",
            "Power BI",
            "Python",
            "Excel",
        ],
        otherSkills: ["HQL", "Tableau", "R", "Machine learning"],
    },

    {
        name: "Руководитель финансового продукта",
        mainSkills: ["Visio"],
        otherSkills: ["Python"],
    },
    {
        name: "Менеджер по маркетингу",
        mainSkills: [
            "Google Analytics",
            "Яндекс.Метрика",
            "Google Ads",
            "Ahrefs",
            "Главред",
            "My Target",
        ],
        otherSkills: ["Tilda", "Photoshop", "Xenu", "Python"],
    },

    {
        name: "Менеджер по цифровой трансформации",
        mainSkills: [
            "Visio",
            "Google Analytics",
            "Яндекс.Метрика",
            "Python",
            "SQL",
            "Tilda",
        ],
        otherSkills: ["Figma", "Sketch", "Shopify"],
    },
]
const rolesArr = data.reduce((acc, item) => {
    return acc.concat(item.name);
}, [])

const skillsArr = Array.from(new Set(data.reduce((acc, item) => {
    return acc.concat(item.mainSkills, item.otherSkills);
}, [])))


const COLOR_GREY = 'rgba(173, 173, 173, 1)'
const COLOR_ORANGE_WEAK = 'rgba(255, 212, 173, 1)'
const COLOR_ORANGE_STRONG = 'rgba(255, 122, 0, 1)'
const COLOR_GREEN = 'rgba(0, 163, 114, 1)'
const COLOR_VIOLET = 'rgba(143, 89, 185, 1)'

const numberOfRoles = 10;
const numberOfSkills = 28;
const rolesAngleStep = (2 * Math.PI) / numberOfRoles;
const skillsAngleStep = (2 * Math.PI) / numberOfSkills;
const innerRingRadius = 254 / 2;
const outerRingRadius = 532 / 2;


//----canvas properties
const canvas = document.getElementById('canvas_plot');
const c = canvas.getContext('2d');

const canvasWidth = canvas.clientWidth;
const canvasHeight = canvas.clientHeight;

const canvasCenter = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
}
//----


let selectedRoleIndex = null;
let selectedSkillIndex = null;
let selectedRole_xy = null
const roles_xy = []
const roles_text_xy = []
const skills_xy = []
const skills_text_xy = []

function drawRing(centerX, centerY, radius) {
    c.lineWidth = 3;
    c.strokeStyle = COLOR_GREY;
    c.beginPath();
    c.arc(centerX, centerY, radius, 0, Math.PI * 2);
    c.stroke();
    c.closePath();
}

function drawPoint(x, y, type) {
    let fillColor
    let isActive = false
    if (type.startsWith('active')) {
        isActive = true
    }

    switch (type) {
        case 'role' :
            fillColor = COLOR_GREY
            break;
        case 'skill' :
            fillColor = COLOR_ORANGE_WEAK
            break;
        case 'linkedRole' :
            fillColor = COLOR_GREEN
            break;
        case 'linkedSkill' :
            fillColor = COLOR_ORANGE_STRONG
            break;
        case 'activeRole' :
            fillColor = COLOR_GREEN
            break;
        case 'activeSkill' :
            fillColor = COLOR_ORANGE_STRONG
            break;
    }

    c.beginPath();

    if (isActive) {
        c.beginPath()
        c.fillStyle = fillColor
        c.arc(x, y, 18, 0, Math.PI * 2, false);
        c.fill();
        c.closePath()
        c.beginPath()
        c.fillStyle = 'white';
        c.arc(x, y, 16, 0, Math.PI * 2, false);
        c.fill();
        c.closePath()
    }

    c.beginPath();
    c.fillStyle = fillColor
    c.arc(x, y, 12, 0, Math.PI * 2, false);
    c.fill();
    c.closePath()

    c.closePath();
}

function drawText(text, textX, textY) {
    const words = text.split(' ');
    let line = '';
    const lineHeight = 12;
    const maxWidth = 75;

    for (let j = 0; j < words.length; j++) {
        const testLine = line + words[j] + ' ';
        const testWidth = c.measureText(testLine).width;

        if (testWidth > maxWidth && j > 0) {
            c.textAlign = 'center'
            c.fillStyle = 'black'
            c.fillText(line, textX, textY);
            line = words[j] + ' ';
            textY += lineHeight;
        } else {
            line = testLine;
        }
    }
    c.textAlign = 'center'
    c.fillStyle = 'black'
    c.fillText(line, textX, textY);
}

function draw() {
    //clear
    roles_xy.length = 0;
    skills_xy.length = 0;
    roles_text_xy.length = 0;
    skills_text_xy.length = 0;
    c.clearRect(0, 0, canvasWidth, canvasHeight);


    let otherSkillsForRole_xy, mainSkillsForRole_xy, activeSkills

    // Draw rings
    drawRing(canvasCenter.x, canvasCenter.y, innerRingRadius);
    drawRing(canvasCenter.x, canvasCenter.y, outerRingRadius);

    // Get roles XY
    for (let i = 0; i < numberOfRoles; i++) {
        const angle = i * rolesAngleStep;
        const roleX = canvasCenter.x + innerRingRadius * Math.cos(angle);
        const roleY = canvasCenter.y + innerRingRadius * Math.sin(angle);
        const textX = canvasCenter.x + (innerRingRadius + 60) * Math.cos(angle);
        const textY = canvasCenter.y + (innerRingRadius + 60) * Math.sin(angle);
        roles_xy.push([roleX, roleY, rolesArr[i]]);
        roles_text_xy.push([textX, textY, rolesArr[i]]);


    }

    // Get skills XY
    for (let i = 0; i < numberOfSkills; i++) {
        const angle = i * skillsAngleStep;
        const skillX = canvasCenter.x + outerRingRadius * Math.cos(angle);
        const skillY = canvasCenter.y + outerRingRadius * Math.sin(angle);
        const textX = canvasCenter.x + (outerRingRadius + 40) * Math.cos(angle);
        const textY = canvasCenter.y + (outerRingRadius + 40) * Math.sin(angle);
        skills_xy.push([skillX, skillY, skillsArr[i]]);
        skills_text_xy.push([textX, textY, skillsArr[i]]);

    }

    //Draw lines

    if (selectedRole_xy !== null) {
        const skillsForRole = data.find(item => item.name === selectedRole_xy[2])
        otherSkillsForRole_xy = skills_xy.filter(item => skillsForRole.otherSkills.includes(item[2]));
        mainSkillsForRole_xy = skills_xy.filter(item => skillsForRole.mainSkills.includes(item[2]));
        activeSkills = otherSkillsForRole_xy.concat(mainSkillsForRole_xy).map(item => item[2]);
    }


    if (selectedRoleIndex !== null) {
        for (let i = 0; i < otherSkillsForRole_xy.length; i++) {
            c.beginPath();
            c.strokeStyle = COLOR_ORANGE_STRONG
            c.moveTo(...selectedRole_xy)
            c.lineTo(otherSkillsForRole_xy[i][0], otherSkillsForRole_xy[i][1])
            c.stroke()
            c.closePath()
        }

        for (let i = 0; i < mainSkillsForRole_xy.length; i++) {
            c.beginPath();
            c.strokeStyle = COLOR_VIOLET
            c.moveTo(...selectedRole_xy)
            c.lineTo(mainSkillsForRole_xy[i][0], mainSkillsForRole_xy[i][1])
            c.stroke()
            c.closePath()
        }
    }
    // Draw roles
    for (let i = 0; i < numberOfRoles; i++) {
        let type

        if (selectedRoleIndex === i) {
            type = 'activeRole'
        } else {
            type = 'role'
        }

        drawPoint(roles_xy[i][0], roles_xy[i][1], type)
        drawText(roles_text_xy[i][2], roles_text_xy[i][0], roles_text_xy[i][1]);
    }

    // Draw skills
    for (let i = 0; i < numberOfSkills; i++) {
        let type

        if (selectedSkillIndex === i) {
            type = 'activeSkill'
        } else if (activeSkills?.includes(skillsArr[i])) {
            type = 'linkedSkill'
        } else {
            type = 'skill'
        }
        drawPoint(skills_xy[i][0], skills_xy[i][1], type)
        drawText(skills_text_xy[i][2], skills_text_xy[i][0], skills_text_xy[i][1]);
    }
}

//Click handler
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let i = 0; i < numberOfRoles; i++) {
        const distance = Math.sqrt((mouseX - roles_xy[i][0]) ** 2 + (mouseY - roles_xy[i][1]) ** 2);
        if (distance < 12) {
            selectedRoleIndex = i;
            selectedRole_xy = [roles_xy[i][0], roles_xy[i][1], roles_xy[i][2]];
            draw();
            return;
        }
    }
    for (let i = 0; i < numberOfSkills; i++) {
        const distance = Math.sqrt((mouseX - skills_xy[i][0]) ** 2 + (mouseY - skills_xy[i][1]) ** 2);
        if (distance < 12) {
            selectedSkillIndex = i;
            draw();
            return;
        }
    }
});

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    let isOverPoint = false;

    for (let i = 0; i < numberOfRoles; i++) {
        const distance = Math.sqrt((mouseX - roles_xy[i][0]) ** 2 + (mouseY - roles_xy[i][1]) ** 2);
        if (distance < 12) {
            isOverPoint = true;
            break;
        }
    }
    for (let i = 0; i < numberOfSkills; i++) {
        const distance = Math.sqrt((mouseX - skills_xy[i][0]) ** 2 + (mouseY - skills_xy[i][1]) ** 2);
        if (distance < 12) {
            isOverPoint = true;
            break;
        }
    }

    // Изменение курсора
    canvas.style.cursor = isOverPoint ? 'pointer' : 'default';
});

draw();


const var1 = {
    'Дизайнер': [500, 400],
    'Менеджер': [150, 300],
    'Предприниматель': [200, 250],
}

const var2 = {
    '500 400': 'Дизайнер',
    '150 300': 'Менеджер',
    '200, 250': 'Предприниматель',
}

const var3 = [
    ['Дизайнер', 500, 400],
    ['Менеджер', 150, 300],
    ['Предприниматель', 200, 250],
]