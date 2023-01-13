const projectHelper = require("../helpers/projects/projectsHelper");
const express = require("express");
const router = new express.Router();

router.post('/create', async (req, res) => {

    const { project, project_skills, project_resource, project_attachment, project_milestone } = req.body;

    const insertProject = await projectHelper.insertProject(project);
    const insertProjectSkills = await projectHelper.insertProjectSkills(project_skills);
    const insertProjectResource = await projectHelper.insertProjectResource(project_resource);
    const insertProjectAttachment = await projectHelper.insertProjectAttachment(project_attachment);
    const insertProjectMilestone = await projectHelper.insertProjectMilestone(project_milestone);

    res.status(200).send({
        message: `Inserted data in all tables sucessfully.`,
    });
});

router.post('/get', async (req, res) => {

    const { project_id, skill_id, resource_id, attachment_id, milestone_id } = req.body;

    const getProject = await projectHelper.getProject(project_id);
    const getProjectSkills = await projectHelper.getProjectSkills(skill_id);
    const getProjectResource = await projectHelper.getProjectResource(resource_id);
    const getProjectAttachment = await projectHelper.getProjectAttachment(attachment_id);
    const getProjectMilestone = await projectHelper.getProjectMilestone(milestone_id);

    res.status(200).send({
        message: `get data in all tables sucessfully.`,
        data: { getProject, getProjectSkills, getProjectResource, getProjectAttachment, getProjectMilestone }
    });

});

router.post('/update', async (req, res) => {

    const { project, project_skills, project_resource, project_attachment, project_milestone } = req.body;

    const updateProject = await projectHelper.updateProject(project);
    const updateProjectSkills = await projectHelper.updateProjectSkills(project_skills);
    const updateProjectResource = await projectHelper.updateProjectResource(project_resource);
    const updateProjectAttachment = await projectHelper.updateProjectAttachment(project_attachment);
    const updateProjectMilestone = await projectHelper.updateProjectMilestone(project_milestone);

    res.status(200).send({
        message: `updated data in all tables sucessfully.`,
    });

});


module.exports = router;