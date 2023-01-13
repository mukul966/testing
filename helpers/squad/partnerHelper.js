const { v4: uuidv4 } = require("uuid");
const Partner = require("../../models/squad/partner");
const db = require("../../routes/dbhelper");
let connection = db.getconnection();

const createPartner = (partnerData) =>
    new Promise(async (resolve, reject) => {
        delete partnerData.partner_id; //edge case
        const partner = new Partner({
            partner_id: uuidv4(),
            ...partnerData
        });

        const createPartnerQuery = 'INSERT INTO squad_partner SET ?';
        connection.query(createPartnerQuery, partner, function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    message: 'Partner Created',
                    partner_id: partner.partner_id
                });
            }
        });
    })
        .then((res) => {
            return res;
        })
        .catch((err) => {
            console.log('err from createPartner() :>> ', err);
            return {
                error: err.message
            };
        });

const getPartnerSquads = (squad_id) =>
    new Promise((resolve, reject) => {
        // Basic data from squad table and profile-image-data from squad_profile_image table
        const imageFields = ['profimgid', 'profimgname', 'profimgurl', 'profimgrotation', 'profimgposition1', 'profimgposition2', 'profimgscale', 'profimgrotationfocuspoint1', 'profimgrotationfocuspoint2'];
        const squadFields = ['squad_name', 'legal_name', 'default_profile_image_id'];
        const partnerFields = ['partner_squad_id AS squad_id'];

        const fields = [...partnerFields.map(e => `squad_partner.${e}`), ...squadFields.map(e => `squad.${e}`), ...imageFields.map(e => `squad_profile_image.${e}`)];

        const query =
            `SELECT 
                ${fields}
                FROM squad_partner
                INNER JOIN squad ON squad.squad_id = squad_partner.partner_squad_id
                LEFT JOIN squad_profile_image ON squad.default_profile_image_id = squad_profile_image.profimgid 
                WHERE squad_partner.squad_id = ?`;

        connection.query(query, squad_id, function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
        .then((res) => {
            return { count: res.length, partner_data: res }
            // return res;
        })
        .catch((err) => {
            console.log('err from getPartnerSquads() :>> ', err);
            return {
                error: err.message
            };
        });

const deletePartner = (partner_id) =>
    new Promise((resolve, reject) => {
        const deleteQuery = `DELETE FROM squad_partner WHERE partner_id = ?`;
        connection.query(deleteQuery, partner_id, function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
        .then((res) => {
            return { success: true, message: "Partner squad removed." };
        })
        .catch((err) => {
            console.log('err from deletePartner() :>> ', err);
            return {
                error: err.message
            };
        });;

module.exports = {
    createPartner,
    getPartnerSquads,
    deletePartner
}