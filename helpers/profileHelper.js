/**[TODO]
 * 1. userHelper - getUserDetails
 *
 */
const { v4: uuidv4 } = require('uuid');
const Profile = require('../models/profile');
const { getUserDetails } = require('./userHelper');
const { addFilledField } = require('./miscHelper');

const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createProfile = (user_id) =>
    new Promise((resolve, reject) => {
        const profile = new Profile({
            profile_id: uuidv4(),
            user_id,
            order_array: '0,1,2,3,4,5,6,7,8,9,10,11',
            followers: 0,
            projects: 0,
            squads: 0,
            currency: '$',
            profile_completion: 7.7
        });

        const createProfileQuery = `INSERT INTO user_profile SET ?`;
        connection.query(createProfileQuery, profile, function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    message: 'Profile Created',
                    profile_id: profile.profile_id,
                    user_id
                });
            }
        });
    })
        .then((res) => {
            return res;
        })
        .catch((err) => {
            console.log('err from createProfile() :>> ', err);
            return {
                error: err.message
            };
        });

const getProfile = async (user_id) => {
    const profileData = await getProfileTable(user_id);
    const userData = await getUserDetails(user_id);

    let profile = Object.assign({}, profileData, userData);
    let general = {};

    general.about_me = {
        content: profile.about_me
    };

    if (profile.core_values === null) {
        general.about_me.core_values = []
    } else {
        general.about_me.core_values = profile.core_values.split(',');
    }


    general.revenue = {
        total_earning: profile.total_earning,
        net_earning: profile.net_earning,
        unreleased: profile.unreleased
    };

    general.linked_account = {
        facebook: profile.facebook,
        twitter: profile.twitter,
        linkedin: profile.linkedin,
        instagram: profile.instagram,
        github: profile.github,
        behance: profile.behance,
        dribble: profile.dribble,
        pinterest: profile.pinterest
    };

    general.contact_detail = {
        city: profile.city,
        state: profile.state,
        country: profile.country,
        country_code: profile.country_code,
        calling_code: profile.calling_code,
        contact_number: profile.contact_number,
        email_id: profile.email_id,
        website: profile.website
    };

    [
        'industry',
        'about_me',
        'core_values',
        'total_earning',
        'net_earning',
        'unreleased',
        'facebook',
        'twitter',
        'linkedin',
        'instagram',
        'github',
        'behance',
        'dribble',
        'pinterest',
        'country_code',
        'calling_code',
        'contact_number',
        'email_id',
        'website',
        'order_array',
        'hidden_array',
        'rejected_array',
        'multiple_array',
        'city',
        'state',
        'country'
    ].forEach((e) => delete profile[e]);

    await addFilledField(general);
    profile.general = general;
    return profile;
};

const getProfileTable = (user_id) =>
    new Promise((resolve, reject) => {
        const query = 'SELECT * FROM `user_profile` WHERE `user_id` = ?';
        connection.query(query, [user_id], function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows[0]);
            }
        });
    })
        .then((response) => response)
        .catch((error) => {
            console.log('error from getProfileTable :>> ', error);
            return {
                error: error.message
            };
        });

const getProfileIdViaUserId = (user_id) =>
    new Promise((resolve, reject) => {
        const query2 = `SELECT profile_id FROM user_profile WHERE user_id = ?`;
        connection.query(query2, user_id, function (err, rows, fields) {
            if (err) {
                console.log('err :>> ', err);
                reject(err);
            } else {
                resolve(rows[0]);
            }
        });
    })
        .then((response) => response)
        .catch((error) => {
            console.log('error from getProfileId :>> ', error);
            return {
                error: error.message
            };
        });

const updateProfile = (update) =>
    new Promise((resolve, reject) => {
        if (!update.hasOwnProperty('user_id')) {
            throw new Error(`Mandatory field 'user_id' missing`);
        }

        const { user_id } = update;
        delete update.user_id;

        if (update.hasOwnProperty('core_values')) {
            if (update.core_values.length > 0) {
                let core_values = update.core_values.join();
                update.core_values = core_values;
            } else {
                update.core_values = null
            }
        }

        if (update.hasOwnProperty('order_array')) {
            let orderValues = update.order_array.join(',');
            update.order_array = orderValues
        }

        const query =
            'UPDATE user_profile SET ' +
            Object.keys(update)
                .map((key) => `${key} = ?`)
                .join(', ') +
            ' WHERE user_id = ?';
        const parameters = [...Object.values(update), user_id];

        connection.query(query, parameters, function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                const message = { message: 'Profle updated' };
                resolve(message);
            }
        });
    })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.log('error from getProfileId :>> ', error);
            return {
                error: error.message
            };
        });

const aux_getProfileData = (user_id) =>
    new Promise((resolve, reject) => {
        const otherUserFields2 = ['default_profile_image_id', 'profile_id', 'profile_completion']
        const imageFields = ['profimgid', 'profimgname', 'profimgurl', 'profimgrotation', 'profimgposition1', 'profimgposition2', 'profimgscale', 'profimgrotationfocuspoint1', 'profimgrotationfocuspoint2']

        const fields = [...otherUserFields2.map(e => `user_profile.${e}`), ...imageFields.map(e => `user_profile_image.${e}`)];

        const query =
            `SELECT ${fields} FROM user_profile
				LEFT JOIN user_profile_image ON user_profile.default_profile_image_id = user_profile_image.profimgid
				WHERE user_id = ?`;

        connection.query(query, user_id, function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.length > 0 ? rows[0] : null);
            }
        });
    })
        .then((res) => {
            if (res === null) { //edge case: profile does not exist.
                return null
            }

            if (res.profile_completion < 7 || res.profile_completion === null) { //adding default value for new profile. changes dynamically when it is profile data is updated. works only when profile is in mint-new condition.
                res.profile_completion = 7
            }

            return res;
        })
        .catch((err) => {
            console.log('error from aux_getProfileData :>> ', err);
            return {
                error: err.message
            };
        })

const profileExists = (profile_id) =>
    new Promise((resolve, reject) => {
        const query = `SELECT profile_id FROM user_profile WHERE profile_id = ?`
        connection.query(query, profile_id, function (err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.length > 0 ? rows[0] : null)
            }
        })
    })
        .then((res) => {
            return res
        })
        .catch((err) => {
            console.log('error from profileExists :>> ', err);
            return {
                error: err.message
            };
        })

module.exports = {
    createProfile,
    getProfileTable,
    getProfile,
    getProfileIdViaUserId,
    updateProfile,
    aux_getProfileData,
    profileExists
};