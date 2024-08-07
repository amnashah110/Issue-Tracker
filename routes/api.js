'use strict';
const { ObjectId } = require('bson');
const Issue = require("../model");

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async (req, res) => {
      let project = req.params.project;
      let filters = { project_name: project };

      for (let [key, value] of Object.entries(req.query)) {
        filters[key] = value;
      }
      try {
        let issues = await Issue.find(filters);
        res.json(issues);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    })


    .post(async (req, res) => {
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      if (!assigned_to) {
        assigned_to = '';
      }
      if (!status_text) {
        status_text = '';
      }
      const created_on = new Date().toISOString();
      const updated_on = new Date().toISOString();
      const open = true;
      const issue = new Issue({ project_name: project, issue_title, issue_text, created_by, assigned_to, status_text, created_on, updated_on, open });
      try {
        await issue.save();
        return res.json({ _id: issue.id, issue_title, issue_text, created_by, assigned_to, status_text, created_on, updated_on, open });
      } catch (error) {
        return res.json({ error: 'post failed' });
      }
    })

    .put(async (req, res) => {
      let project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      const fieldNames = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];
      const fields = [issue_title, issue_text, created_by, assigned_to, status_text, open];

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      if (Object.keys(req.body).length === 1 && Object.keys(req.body)[0] === '_id') {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      try {
        const updating = await Issue.findById(_id);
        if (!updating) {
          return res.json({ error: 'could not update', _id });
        }

        let updated = false;

        for (let i = 0; i < fieldNames.length; i++) {
          if (fields[i] != null && fields[i] !== '') {
            updating[fieldNames[i]] = fields[i];
            updated = true;
          }
        }

        if (updated) {
          updating.updated_on = new Date();
          await updating.save();
          return res.json({ result: 'successfully updated', _id });
        } else {
          return res.json({ error: 'no update field(s) sent', _id });
        }
      } catch (error) {
        return res.json({ error: 'could not update', _id });
      }
    })

    .delete(async (req, res) => {
      let project = req.params.project;
      const { _id } = req.body;
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      try {
        const issue = await Issue.findByIdAndDelete(_id);
        if (issue) {
          return res.json({ result: 'successfully deleted', _id });
        } else {
          return res.json({ error: 'could not delete', _id });
        }
      } catch (error) {
        return res.json({ error: 'could not delete', _id });
      }
    });
};
