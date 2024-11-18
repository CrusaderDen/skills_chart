//---Constants and Initial parameters
const COLOR_GREY = 'rgba(173, 173, 173, 1)'
const COLOR_ORANGE_WEAK = 'rgba(255, 212, 173, 1)'
const COLOR_ORANGE_STRONG = 'rgba(255, 122, 0, 1)'
const COLOR_GREEN = 'rgba(0, 163, 114, 1)'
const COLOR_VIOLET = 'rgba(143, 89, 185, 1)'
const innerRingRadius = 254 / 2;
const outerRingRadius = 532 / 2;

//---

//---Get initial data
function initial(obj) {

    const skills = Array.from(new Set(obj.reduce((acc, item) => {
        return acc.concat(item.mainSkills, item.otherSkills).sort();
    }, [])))


    const chart_data = {
        roles: {},
        skills: {},
    }
    let idRolesCounter = 0
    let idSkillsCounter = 0
    obj.forEach(item => {
        const id = idRolesCounter++
        chart_data.roles[id] = {...item, x: null, y: null, text_x: null, text_y: null, angle: null};
    })
    skills.forEach(item => {
        const id = idSkillsCounter++
        chart_data.skills[id] = {name: item, x: null, y: null, text_x: null, text_y: null, angle: null};
    })

    return chart_data
}

let chart_data = initial(initial_data)

chart_data = {
    ...chart_data,
    selectedRoleId: null,
    selectedSkillId: null,
    linkedPoints: [],
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
    },
    get rolesCount() {
        return Object.keys(this.roles).length
    },
    get skillsCount() {
        return Object.keys(this.skills).length
    },

}

const rolesCount = chart_data.rolesCount;
const skillsCount = chart_data.skillsCount;
const rolesAngleStep = (2 * Math.PI) / rolesCount;
const skillsAngleStep = (2 * Math.PI) / skillsCount;

//---

//---Get canvas
const canvas = document.getElementById('canvas_plot');
const c = canvas.getContext('2d');

const canvasWidth = canvas.clientWidth;
const canvasHeight = canvas.clientHeight;

const canvasCenter = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
}

//---

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

function findClosestSkillIdsForRole(chart_data, roleId, closestCount) {
    const targetAngle = chart_data.roles[roleId].angle
    const skills = chart_data.skills
    const skillsToArr = Object.entries(skills)
    skillsToArr.sort((a, b) => Math.abs(a[1].angle - targetAngle) - Math.abs(b[1].angle - targetAngle))
    return skillsToArr.slice(0, closestCount).map(skill => skill[0]).sort((a, b) => a - b)

}

function findClosestRoleIdsForSkill(chart_data, skillId, closestCount) {
    const targetAngle = chart_data.skills[skillId].angle
    const roles = chart_data.roles
    const rolesToArr = Object.entries(roles)
    rolesToArr.sort((a, b) => Math.abs(a[1].angle - targetAngle) - Math.abs(b[1].angle - targetAngle))
    return rolesToArr.slice(0, closestCount).map(skill => skill[0]).sort((a, b) => a - b)
}


function draw() {
    c.clearRect(0, 0, canvasWidth, canvasHeight);

    // Get element coordinates
    for (let i = 0; i < rolesCount; i++) {
        const angle = (i * rolesAngleStep) - 3.14 / 2;
        const role_X = canvasCenter.x + innerRingRadius * Math.cos(angle);
        const role_Y = canvasCenter.y + innerRingRadius * Math.sin(angle);
        const text_X = canvasCenter.x + (innerRingRadius + 55) * Math.cos(angle);
        const text_Y = canvasCenter.y + (innerRingRadius + 55) * Math.sin(angle);
        chart_data.roles[i].x = role_X
        chart_data.roles[i].y = role_Y
        chart_data.roles[i].text_x = text_X
        chart_data.roles[i].text_y = text_Y
        chart_data.roles[i].angle = angle
    }

    for (let i = 0; i < skillsCount; i++) {
        const angle = (i * skillsAngleStep) - 3.14 / 2;
        const skill_X = canvasCenter.x + outerRingRadius * Math.cos(angle);
        const skill_Y = canvasCenter.y + outerRingRadius * Math.sin(angle);
        const text_X = canvasCenter.x + (outerRingRadius + 40) * Math.cos(angle);
        const text_Y = canvasCenter.y + (outerRingRadius + 40) * Math.sin(angle);
        chart_data.skills[i].x = skill_X
        chart_data.skills[i].y = skill_Y
        chart_data.skills[i].text_x = text_X
        chart_data.skills[i].text_y = text_Y
        chart_data.skills[i].angle = angle
    }
    //Sort skills for selected role
    if (chart_data.selectedRoleId !== null) {
        const mainSkillsForSelectedRole = chart_data.roles[chart_data.selectedRoleId].mainSkills;
        const otherSkillsForSelectedRole = chart_data.roles[chart_data.selectedRoleId].otherSkills;
        const commonSkillsArr = [...mainSkillsForSelectedRole, ...otherSkillsForSelectedRole];
        chart_data.linkedPoints = [...commonSkillsArr]
        const skillIdsForReplace = findClosestSkillIdsForRole(chart_data, chart_data.selectedRoleId, commonSkillsArr.length)
        const skillsValues = Object.values(chart_data.skills)
        const start = +skillIdsForReplace.at(0)
        const end = +skillIdsForReplace.at(-1)
        for (let i = start; i <= end; i++) {
            const skill_1 = commonSkillsArr.pop()
            const skill_2 = skillsValues[i].name
            if (skill_1 === skill_2) continue
            const objectForReplace = skillsValues.find(skill => skill.name === skill_1)
            objectForReplace.name = skill_2
            skillsValues[i].name = skill_1
        }
    }

    //Sort roles for selected skill
    if (chart_data.selectedSkillId !== null) {
        const selectedSkillName = chart_data.skills[chart_data.selectedSkillId].name
        const rolesForSelectedSkill = Object.values(chart_data.roles).reduce((res, role) => {
            if (role.mainSkills.includes(selectedSkillName) || role.otherSkills.includes(selectedSkillName)) {
                res.push(role.name)
            }
            return res
        }, [])
        chart_data.linkedPoints = rolesForSelectedSkill
        const roleIdsForReplace = findClosestRoleIdsForSkill(chart_data, chart_data.selectedSkillId, rolesForSelectedSkill.length)
        const roleValues = Object.values(chart_data.roles)
        const start = +roleIdsForReplace.at(0)
        const end = +roleIdsForReplace.at(-1)
        for (let i = start; i <= end; i++) {
            const role_1 = rolesForSelectedSkill.pop()
            const role_2 = roleValues[i].name
            if (role_1 === role_2) continue
            let objectForReplace_1 = roleValues.findIndex(role => role.name === role_1)
            let objectForReplace_2 = roleValues.findIndex(role => role.name === role_2)
            let coords_1 = {
                x: chart_data.roles[objectForReplace_1].x,
                y: chart_data.roles[objectForReplace_1].y,
                text_x: chart_data.roles[objectForReplace_1].text_x,
                text_y: chart_data.roles[objectForReplace_1].text_y,
                angle: chart_data.roles[objectForReplace_1].angle
            }
            let coords_2 = {
                x: chart_data.roles[objectForReplace_2].x,
                y: chart_data.roles[objectForReplace_2].y,
                text_x: chart_data.roles[objectForReplace_2].text_x,
                text_y: chart_data.roles[objectForReplace_2].text_y,
                angle: chart_data.roles[objectForReplace_2].angle
            }
            let temp = chart_data.roles[objectForReplace_2]
            chart_data.roles[objectForReplace_2] = {...chart_data.roles[objectForReplace_1], ...coords_2}
            chart_data.roles[objectForReplace_1] = {...temp, ...coords_1}
        }
    }

    //Draw lines
    if (chart_data.selectedRoleId !== null) {

        const selectedRole = chart_data.roles[chart_data.selectedRoleId];
        const skills = Object.values(chart_data.skills)
        for (let i = 0; i < selectedRole.otherSkills.length; i++) {
            const skill = skills.find(skill => skill.name === selectedRole.otherSkills[i])
            c.beginPath();
            c.strokeStyle = COLOR_ORANGE_STRONG
            c.moveTo(selectedRole.x, selectedRole.y)
            c.lineTo(skill.x, skill.y)
            c.stroke()
            c.closePath()
        }

        for (let i = 0; i < selectedRole.mainSkills.length; i++) {
            const skill = skills.find(skill => skill.name === selectedRole.mainSkills[i])
            c.beginPath();
            c.strokeStyle = COLOR_VIOLET
            c.moveTo(selectedRole.x, selectedRole.y)
            c.lineTo(skill.x, skill.y)
            c.stroke()
            c.closePath()
        }

    }
    if (chart_data.selectedSkillId !== null) {

        const selectedSkill = chart_data.skills[chart_data.selectedSkillId];
        const rolesArr = Object.values(chart_data.roles)
        const rolesForSelectedSkill = rolesArr.reduce((res, role) => {
            if (role.mainSkills.includes(selectedSkill.name) || role.otherSkills.includes(selectedSkill.name)) {
                res.push(role.name)
            }
            return res
        }, [])
        chart_data.linkedPoints = rolesForSelectedSkill
        for (let i = 0; i < rolesForSelectedSkill.length; i++) {
            const role = Object.values(chart_data.roles).find(role => role.name === rolesForSelectedSkill[i])
            c.beginPath();
            c.strokeStyle = COLOR_ORANGE_STRONG
            c.moveTo(selectedSkill.x, selectedSkill.y)
            c.lineTo(role.x, role.y)
            c.stroke()
            c.closePath()
        }


    }

    // Draw rings
    drawRing(canvasCenter.x, canvasCenter.y, innerRingRadius);
    drawRing(canvasCenter.x, canvasCenter.y, outerRingRadius);
    console.log(chart_data)
    //Draw points
    for (let i = 0; i < rolesCount; i++) {
        let variant

        if (chart_data.selectedRoleId === i) {
            variant = 'activeRole'
        } else if (chart_data.linkedPoints.includes(chart_data.rolesList[i])) {
            variant = 'linkedRole'
        } else {
            variant = 'role'
        }
        let currentRole = chart_data.roles[i]
        drawPoint(currentRole.x, currentRole.y, variant)
    }

    for (let i = 0; i < skillsCount; i++) {
        let variant

        if (chart_data.selectedSkillId === i) {
            variant = 'activeSkill'
        } else if (chart_data.linkedPoints.includes(chart_data.skillsList[i])) {
            variant = 'linkedSkill'
        } else {
            variant = 'skill'
        }
        let currentSkill = chart_data.skills[i]
        drawPoint(currentSkill.x, currentSkill.y, variant)
    }

    //Draw text
    for (let i = 0; i < rolesCount; i++) {
        let currentRole = chart_data.roles[i]
        drawText(currentRole.text_x, currentRole.text_y, currentRole.name);
    }

    for (let i = 0; i < skillsCount; i++) {
        let currentSkill = chart_data.skills[i]
        drawText(currentSkill.text_x, currentSkill.text_y, currentSkill.name);
    }

}


// Event handlers
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let i = 0; i < skillsCount; i++) {
        let currentSkill = chart_data.skills[i]
        const distance = Math.sqrt((mouseX - currentSkill.x) ** 2 + (mouseY - currentSkill.y) ** 2);
        if (distance < 12) {
            chart_data.selectedRoleId = null
            chart_data.selectedSkillId = i;
            draw();
            return;
        }
    }

    for (let i = 0; i < rolesCount; i++) {
        let currentRole = chart_data.roles[i]
        const distance = Math.sqrt((mouseX - currentRole.x) ** 2 + (mouseY - currentRole.y) ** 2);
        if (distance < 12) {
            chart_data.selectedSkillId = null
            chart_data.selectedRoleId = i;
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

    for (let i = 0; i < skillsCount; i++) {
        let currentSkill = chart_data.skills[i]
        const distance = Math.sqrt((mouseX - currentSkill.x) ** 2 + (mouseY - currentSkill.y) ** 2);
        if (distance < 12) {
            isOverPoint = true;
            break;
        }
    }

    for (let i = 0; i < rolesCount; i++) {
        let currentRole = chart_data.roles[i]
        const distance = Math.sqrt((mouseX - currentRole.x) ** 2 + (mouseY - currentRole.y) ** 2);
        if (distance < 12) {
            isOverPoint = true;
            break;
        }
    }


    // Изменение курсора
    canvas.style.cursor = isOverPoint ? 'pointer' : 'default';
});

draw();