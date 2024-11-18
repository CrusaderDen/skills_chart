function initial(obj) {

    const skills = Array.from(new Set(obj.reduce((acc, item) => {
        return acc.concat(item.mainSkills, item.otherSkills).sort();
    }, [])))


    const chart_data = {
        roles: {},
        skills: {},
    }
    let idCounter = 0
    obj.forEach(item => {
        const id = idCounter++
        chart_data.roles[id] = {...item, x: null, y: null, angle: null};
    })
    skills.forEach(item => {
        const id = idCounter++
        chart_data.skills[id] = {name: item, x: null, y: null, angle: null};
    })

    return chart_data
}

let chart_data = initial(initial_data)

chart_data = {
    ...chart_data,
    get rolesList() {
        const res = []
        for (let key in this.roles) {
            res.push(this.roles[key].name)
        }
        return res
    },
    get skillsList() {
        const res = []
        for (let key in this.skills) {
            res.push(this.skills[key].name)
        }
        return res
    }
}

const roles = chart_data.skillsList
console.log(roles)

const rolesArr = initial_data.reduce((acc, item) => {
    return acc.concat(item.name);
}, [])

const skillsArr = Array.from(new Set(initial_data.reduce((acc, item) => {
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
let selectedSkill_xy = null
let roles_xy = []
let roles_text_xy = []
let skills_xy = []
let skills_text_xy = []

function drawRing(centerX, centerY, radius) {
    c.lineWidth = 3;
    c.strokeStyle = COLOR_GREY;
    c.beginPath();
    c.arc(centerX, centerY, radius, 0, Math.PI * 2);
    c.stroke();
    c.closePath();
}

function drawPoint(x, y, variant) {
    let fillColor
    let isActive = false
    if (variant.startsWith('active')) {
        isActive = true
    }

    switch (variant) {
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

function drawText(textX, textY, text) {
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

function findClosestIndexes(arr, target, count) {
    const onlyAngles = arr.map(el => el[3])
    const indexedArray = onlyAngles.map((value, index) => ({value, index}));
    indexedArray.sort((a, b) => Math.abs(a.value - target) - Math.abs(b.value - target));
    const closestIndices = indexedArray.slice(0, count).map(item => item.index);
    closestIndices.sort((a, b) => a - b);

    return closestIndices;

}

function draw() {
    //clear
    roles_xy.length = 0;
    skills_xy.length = 0;
    roles_text_xy.length = 0;
    skills_text_xy.length = 0;
    c.clearRect(0, 0, canvasWidth, canvasHeight);


    let otherSkillsForRole_xy, mainSkillsForRole_xy
    let activeSkills = []

    // Draw rings
    drawRing(canvasCenter.x, canvasCenter.y, innerRingRadius);
    drawRing(canvasCenter.x, canvasCenter.y, outerRingRadius);

    // Get roles XY
    for (let i = 0; i < numberOfRoles; i++) {
        const angle = (i * rolesAngleStep) - 3.14 / 2;
        const roleX = canvasCenter.x + innerRingRadius * Math.cos(angle);
        const roleY = canvasCenter.y + innerRingRadius * Math.sin(angle);
        const textX = canvasCenter.x + (innerRingRadius + 60) * Math.cos(angle);
        const textY = canvasCenter.y + (innerRingRadius + 60) * Math.sin(angle);
        roles_xy.push([roleX, roleY, rolesArr[i], angle]);
        roles_text_xy.push([textX, textY, rolesArr[i]]);

    }

    // Get skills XY
    for (let i = 0; i < numberOfSkills; i++) {
        const angle = (i * skillsAngleStep) - 3.14 / 2;
        const skillX = canvasCenter.x + outerRingRadius * Math.cos(angle);
        const skillY = canvasCenter.y + outerRingRadius * Math.sin(angle);
        const textX = canvasCenter.x + (outerRingRadius + 40) * Math.cos(angle);
        const textY = canvasCenter.y + (outerRingRadius + 40) * Math.sin(angle);
        skills_xy.push([skillX, skillY, skillsArr[i], angle]);
        skills_text_xy.push([textX, textY, skillsArr[i]]);
    }
    // Get lines XY
    if (selectedRole_xy !== null) {
        const skillsForRole = initial_data.find(item => item.name === selectedRole_xy[2])
        otherSkillsForRole_xy = skills_xy.filter(item => skillsForRole.otherSkills.includes(item[2]));
        mainSkillsForRole_xy = skills_xy.filter(item => skillsForRole.mainSkills.includes(item[2]));
        activeSkills = otherSkillsForRole_xy.concat(mainSkillsForRole_xy).map(item => item[2]);
    }

    // if (selectedRoleIndex !== null) {
    //     const indexes = findClosestIndexes(roles_xy, selectedRole_xy[3], activeSkills.length)
    //     const titles = skills_xy.map(el => el[2])
    //     for (let i = indexes[0]; i <= indexes.at(-1); i++) {
    //         let saveChanged = titles[i]
    //         let forInsert = activeSkills.splice(0, 1)[0]
    //         titles[i] = forInsert
    //         let index = titles.findIndex((item, index) => {
    //             return item === forInsert && !indexes.includes(index)
    //         })
    //         titles[index] = saveChanged
    //     }
    //     skills_xy = skills_xy.map((item, index) => {
    //         return [item[0], item[1], titles[index], item[3]]
    //     })
    //     skills_text_xy = skills_text_xy.map((item, index) => {
    //         return [item[0], item[1], titles[index]]
    //     })
    //     console.log()
    // }

    //Draw lines

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
        drawText(roles_text_xy[i][0], roles_text_xy[i][1], roles_text_xy[i][2]);
    }


    // Draw skills
    for (let i = 0; i < numberOfSkills; i++) {
        let variant

        if (selectedSkillIndex === i) {
            variant = 'activeSkill'
        } else if (activeSkills?.includes(skillsArr[i])) {
            variant = 'linkedSkill'
        } else {
            variant = 'skill'
        }
        drawPoint(skills_xy[i][0], skills_xy[i][1], variant)
        drawText(skills_text_xy[i][0], skills_text_xy[i][1], skills_text_xy[i][2]);
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
            selectedSkillIndex = null
            selectedSkill_xy = null
            selectedRoleIndex = i;
            selectedRole_xy = [roles_xy[i][0], roles_xy[i][1], roles_xy[i][2], roles_xy[i][3]];
            draw();
            return;
        }
    }
    for (let i = 0; i < numberOfSkills; i++) {
        const distance = Math.sqrt((mouseX - skills_xy[i][0]) ** 2 + (mouseY - skills_xy[i][1]) ** 2);
        if (distance < 12) {
            selectedRoleIndex = null
            selectedRole_xy = null
            selectedSkillIndex = i;
            selectedSkill_xy = [skills_xy[i][0], skills_xy[i][1], skills_xy[i][2], skills_xy[i][3]];
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

const chart_example = {
    roles: {
        id_383839: {
            name: 'Финансовый аналитик',
            x: 200,
            y: 400,
            angle: 2.08,
            mainSkills: ["Excel", "SQL", "VBA", "1С"],
            otherSkills: ["Power BI", "Python"],
        },
        id_383845: {
            name: 'Предприниматель',
            x: 240,
            y: 380,
            angle: 3.14,
            mainSkills: ["1C", "Excel", "Power BI"],
            otherSkills: [
                "Google Analytics",
                "Яндекс.Метрика",
                "Python",
                "SQL",
                "Tilda",
            ],
        }
    },
    skills: {
        id_383123: {
            name: 'Python',
            x: 465,
            y: 688,
            angle: 0.56
        },
        id_386768: {
            name: 'SQL',
            x: 190,
            y: 365,
            angle: 1.38
        }
    },

    getRoles() {
        for (let key in this.roles) {
            console.log(this.roles[key].name)
        }
    },
    getSkills() {
        for (let key in this.skills) {
            console.log(this.skills[key].name)
        }
    }

}

