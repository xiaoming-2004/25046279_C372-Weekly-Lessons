const petModel = require('../models/petModel');

function newPetForm(req, res) {
  res.render('newPet', { session: req.session });
}

function createPet(req, res) {
  const { pet_name, species, breed, age } = req.body;
  const petImage = req.file ? req.file.filename : null;
  const ownerId = req.session.user.id;

  petModel.createPet(ownerId, pet_name, species, breed, age, petImage, (err) => {
    if (err) {
      console.error(err);
      return res.send('Failed to add pet.');
    }
    res.redirect('/journals');
  });
}

module.exports = { newPetForm, createPet };
