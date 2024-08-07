const mongoose = require("mongoose");
const { Schema } = mongoose;

const issueSchema = new Schema({
    project_name: { type: String, required: true },
    assigned_to: { type: String, default: '' },
    status_text: { type: String, default: '' },
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    created_on:  String,
    updated_on: String,
    open: { type: Boolean, default: true }
});

module.exports = mongoose.model('Issue', issueSchema);