
const mongoose = require('mongoose');

function reproduce() {
    try {
        const tenantId = 'undefined';
        console.log('Testing with tenantId:', tenantId);
        const objectId = new mongoose.Types.ObjectId(tenantId);
        console.log('Created ObjectId:', objectId);
    } catch (error) {
        console.error('Caught expected error:', error.message);
    }

    try {
        const tenantId = 'null';
        console.log('Testing with tenantId:', tenantId);
        const objectId = new mongoose.Types.ObjectId(tenantId);
        console.log('Created ObjectId:', objectId);
    } catch (error) {
        console.error('Caught expected error:', error.message);
    }
}

reproduce();
