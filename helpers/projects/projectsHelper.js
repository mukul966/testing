const db = require('../../routes/dbhelper');
var pool = db.getconnection();

// const GetData = () =>
//   new Promise((resolve, reject) => {
//     console.log("yes");
//     const query = pool.query(
//       "SELECT * FROM table1",
//       (err, rows, fields) => {
//         if (err) {
//           reject({ error: err.message });
//         } else {
//           resolve(rows);
//         }
//       }
//     );
//   })
//     .then((rows) => {
//       return rows;
//     })
//     .catch((error) => {
//       return error;
//     });

// const deleteData = () =>
//   new Promise((resolve, reject) => {
//     console.log("yes");
//     const query = pool.query(
//       "DELETE FROM table1 WHERE user_id = ?",
//       [],
//       (err) => {
//         if (err) {
//           reject({ error: err.message });
//         } else {
//           resolve(rows);
//         }
//       }
//     );
//   })
//     .then((rows) => {
//       return rows;
//     })
//     .catch((error) => {
//       return error;
//     });

// const updateData = () =>
//   new Promise((resolve, reject) => {
//     const query = pool.query("UPDATE table1 SET ", [], (err) => {
//       if (err) {
//         reject({ error: err.message });
//       } else {
//         resolve(rows);
//       }
//     });
//   })
//     .then((rows) => {
//       return rows;
//     })
//     .catch((error) => {
//       return error;
//     });

// const createData = () =>
//   new Promise((resolve, reject) => {
//     const query = pool.query(
//       "INSERT INTO project_table1() VALUES(?,?,?)",
//       [],
//       (err) => {
//         if (err) {
//           reject({ error: err.message });
//         } else {
//           resolve(rows);
//         }
//       }
//     );
//   })
//     .then((rows) => {
//       return rows;
//     })
//     .catch((error) => {
//       return error;
//     });

// create in tables
const insertProject = (project) =>
    new Promise((resolve, reject) => {
        const query =
            "INSERT INTO project(project_id,client_squad_id,vendor_squad_id,archive_work_id,archive_application_id,project_status,project_title,industry,state,country,project_type,projectHR_currency,projectHR_amount,fixedHR_currency,fixedHR_amount,billing_currency,project_payment_frequency,payment_terms) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        pool.query(
            query,
            [
                project.project_id,
                project.client_squad_id,
                project.vendor_squad_id,
                project.archive_work_id,
                project.archive_application_id,
                project.project_status,
                project.project_title,
                project.industry,
                project.state,
                project.country,
                project.project_type,
                project.projectHR_currency,
                project.projectHR_amount,
                project.fixedHR_currency,
                project.fixedHR_amount,
                project.billing_currency,
                project.project_payment_frequency,
                project.payment_terms,
                project.start_date,
                project.end_date,
            ],
            function (err, rows, result) {
                if (err) {
                    reject({ error: err.message });
                } else {
                    resolve(rows);
                }
            }
        );
    })
        .then((rows) => {
            return rows;
        })
        .catch((error) => {
            return error;
        });

const insertProjectSkills = (project_skills) =>
    new Promise((resolve, reject) => {
        // console.log(project_skills);
        const { skill_id, project_id, skill_name, created_at, updated_at } =
            project_skills;

        const query = "INSERT INTO project_skill() VALUES(?,?,?)";
        pool.query(
            query,
            [skill_id, project_id, skill_name, created_at, updated_at],
            function (err, rows, result) {
                if (err) {
                    reject({ error: err.message });
                } else {
                    resolve(rows);
                }
            }
        );
    })
        .then((rows) => {
            return rows;
        })
        .catch((error) => {
            return error;
        });

const insertProjectResource = (project_resource) =>
    new Promise((resolve, reject) => {
        const query =
            "INSERT INTO project_resource(resource_id,user_id,role_name,currency,hourly_rate) VALUES (?,?,?,?,?)";
        pool.query(
            query,
            [
                project_resource.resource_id,
                project_resource.user_id,
                project_resource.role_name,
                project_resource.currency,
                project_resource.hourly_rate,
                project_resource.created_at,
                project_resource.updated_at,
            ],
            function (err, rows, result) {
                if (err) {
                    reject({ error: err.message });
                } else {
                    resolve(rows);
                }
            }
        );
    })
        .then((rows) => {
            return rows;
        })
        .catch((error) => {
            return error;
        });

const insertProjectAttachment = (project_attachment) =>
    new Promise((resolve, reject) => {
        const query =
            "INSERT INTO project_attachment(attachment_id,project_id,file_name,file_url,file_type) VALUES (?,?,?,?,?)";
        pool.query(
            query,
            [
                project_attachment.attachment_id,
                project_attachment.project_id,
                project_attachment.file_name,
                project_attachment.file_url,
                project_attachment.file_type,
                project_attachment.created_at,
                project_attachment.updated_at,
            ],
            function (err, rows, result) {
                if (err) {
                    reject({ error: err.message });
                } else {
                    resolve(rows);
                }
            }
        );
    })
        .then((rows) => {
            return rows;
        })
        .catch((error) => {
            return error;
        });

const insertProjectMilestone = (project_milestone) =>
    new Promise((resolve, reject) => {
        const query =
            "INSERT INTO project_milestone(milestone_id,project_id,name,currency,amount,description) VALUES (?,?,?,?,?,?)";

        pool.query(
            query,
            [
                project_milestone.milestone_id,
                project_milestone.project_id,
                project_milestone.name,
                project_milestone.currency,
                project_milestone.amount,
                project_milestone.description,
                project_milestone.created_at,
                project_milestone.updated_at,
            ],
            function (err, rows, result) {
                if (err) {
                    reject({ error: err.message });
                } else {
                    resolve(rows);
                }
            }
        );
    })
        .then((rows) => {
            return rows;
        })
        .catch((error) => {
            return error;
        });

// GET in table
const getProject = (project_id) =>
    new Promise((resolve, reject) => {
        // console.log(project_skills);

        const query = "SELECT * from project where project_id=?";
        pool.query(query, [project_id], function (err, rows, result) {
            if (err) {
                reject({ error: err.message });
            } else {
                resolve(rows);
            }
        });
    })
        .then((rows) => {
            return rows[0];
        })
        .catch((error) => {
            return error;
        });

const getProjectSkills = (skill_id) =>
    new Promise((resolve, reject) => {
        // console.log(project_skills);

        const query = "SELECT * from project_skill where skill_id=?";
        pool.query(query, [skill_id], function (err, rows, result) {
            if (err) {
                reject({ error: err.message });
            } else {
                resolve(rows);
            }
        });
    })
        .then((rows) => {
            return rows[0];
        })
        .catch((error) => {
            return error;
        });
const getProjectResource = (resource_id) =>
    new Promise((resolve, reject) => {
        // console.log(project_skills);

        const query = "SELECT * from project_resource where resource_id=?";
        pool.query(query, [resource_id], function (err, rows, result) {
            if (err) {
                reject({ error: err.message });
            } else {
                resolve(rows);
            }
        });
    })
        .then((rows) => {
            return rows[0];
        })
        .catch((error) => {
            return error;
        });
const getProjectAttachment = (attachment_id) =>
    new Promise((resolve, reject) => {
        // console.log(project_skills);

        const query = "SELECT * from project_attachment where attachment_id=?";
        pool.query(query, [attachment_id], function (err, rows, result) {
            if (err) {
                reject({ error: err.message });
            } else {
                resolve(rows);
            }
        });
    })
        .then((rows) => {
            return rows[0];
        })
        .catch((error) => {
            return error;
        });
const getProjectMilestone = (milestone_id) =>
    new Promise((resolve, reject) => {
        // console.log(project_skills);

        const query = "SELECT * from project_milestone where milestone_id=?";
        pool.query(query, [milestone_id], function (err, rows, result) {
            if (err) {
                reject({ error: err.message });
            } else {
                resolve(rows);
            }
        });
    })
        .then((rows) => {
            return rows[0];
        })
        .catch((error) => {
            return error;
        });

// update table

const updateProject = (project) =>
    new Promise((resolve, reject) => {
        const query =
            "UPDATE project SET client_squad_id=?,vendor_squad_id=?,archive_work_id=?,archive_application_id=?,project_status=?,project_title=?,industry=?,state=?,country=?,project_type=?,projectHR_currency=?,projectHR_amount=?,fixedHR_currency=?,fixedHR_amount=?,billing_currency=?,project_payment_frequency=?,payment_terms=? WHERE project_id=?";
        pool.query(
            query,
            [
                project.client_squad_id,
                project.vendor_squad_id,
                project.archive_work_id,
                project.archive_application_id,
                project.project_status,
                project.project_title,
                project.industry,
                project.state,
                project.country,
                project.project_type,
                project.projectHR_currency,
                project.projectHR_amount,
                project.fixedHR_currency,
                project.fixedHR_amount,
                project.billing_currency,
                project.project_payment_frequency,
                project.payment_terms,
                project.project_id,
            ],
            function (err, rows, result) {
                if (err) {
                    reject({ error: err.message });
                } else {
                    resolve(rows);
                }
            }
        );
    })
        .then((rows) => {
            return rows;
        })
        .catch((error) => {
            return error;
        });

const updateProjectSkills = (project_skills) =>
    new Promise((resolve, reject) => {
        const query =
            "UPDATE project SET project_id=?,skill_name=? WHERE skill_id=?";
        pool.query(
            query,
            [
                project_skills.project_id,
                project_skills.skill_name,
                project_skills.skill_id,
            ],
            function (err, rows, result) {
                if (err) {
                    reject({ error: err.message });
                } else {
                    resolve(rows);
                }
            }
        );
    })
        .then((rows) => {
            return rows;
        })
        .catch((error) => {
            return error;
        });

const updateProjectResource = (project_resource) =>
    new Promise((resolve, reject) => {
        const query =
            "UPDATE project_resource SET user_id=?,role_name=?,currency=?,hourly_rate=? WHERE resource_id=?";
        pool.query(
            query,
            [
                project_resource.user_id,
                project_resource.role_name,
                project_resource.currency,
                project_resource.hourly_rate,
                project_resource.resource_id,
            ],
            function (err, rows, result) {
                if (err) {
                    reject({ error: err.message });
                } else {
                    resolve(rows);
                }
            }
        );
    })
        .then((rows) => {
            // console.log(rows);
            return rows;
        })
        .catch((error) => {
            return error;
        });

const updateProjectAttachment = (project_attachment) =>
    new Promise((resolve, reject) => {
        const query =
            "UPDATE project_attachment SET project_id=?,file_name=?,file_url=?,file_type=? WHERE attachment_id=?";
        pool.query(
            query,
            [
                project_attachment.project_id,
                project_attachment.file_name,
                project_attachment.file_url,
                project_attachment.file_type,
                project_attachment.attachment_id,
            ],
            function (err, rows, result) {
                if (err) {
                    reject({ error: err.message });
                } else {
                    resolve(rows);
                }
            }
        );
    })
        .then((rows) => {
            return rows;
        })
        .catch((error) => {
            return error;
        });

const updateProjectMilestone = (project_milestone) =>
    new Promise((resolve, reject) => {
        const query =
            "UPDATE project_milestone SET project_id=?,name=?,currency=?,amount=?,description=? WHERE milestone_id=?";
        pool.query(
            query,
            [
                project_milestone.project_id,
                project_milestone.name,
                project_milestone.currency,
                project_milestone.amount,
                project_milestone.description,
                project_milestone.milestone_id,
            ],
            function (err, rows, result) {
                if (err) {
                    reject({ error: err.message });
                } else {
                    resolve(rows);
                }
            }
        );
    })
        .then((rows) => {
            // console.log(rows);
            return rows;
        })
        .catch((error) => {
            return error;
        });

module.exports = {
    insertProject,
    insertProjectSkills,
    insertProjectResource,
    insertProjectAttachment,
    insertProjectMilestone,
    getProject,
    getProjectSkills,
    getProjectResource,
    getProjectAttachment,
    getProjectMilestone,
    updateProject,
    updateProjectSkills,
    updateProjectResource,
    updateProjectAttachment,
    updateProjectMilestone,
};
