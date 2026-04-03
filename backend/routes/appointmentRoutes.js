const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// CREATE (POST)
router.post('/', appointmentController.createAppointment);

// READ (GET all)
router.get('/', appointmentController.getAppointments);

// UPDATE (PUT)
router.put('/:id', appointmentController.updateAppointment);

// DELETE (we will use next)
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;