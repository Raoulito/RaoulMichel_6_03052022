const Sauce = require("../models/Sauce");
const fs = require("fs");

//Get a sauce by id
exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ message: "Sauce non trouvée !" });
      }
      return res.status(200).json(sauce);
    })
    .catch((error) => res.status(404).json({ error }));
};

//Creates a new sauce and uploads the image and initializes the likes and dislikes
exports.createSauce = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce); //Shit front sending sauce as a string
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    //Image URL
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    //Initializes likes and dislikes
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then((sauce) => res.status(201).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};

//Updates a sauce
exports.updateOneSauce = (req, res) => {
  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        if (!sauce) {
          return res.status(404).json({ message: "Sauce non trouvée !" });
        }
        //Gets the old image URL
        const filename = sauce.imageUrl.split("/images/")[1];
        //Deletes the old image
        fs.unlink(`images/${filename}`, () => {
          const sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
          };
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
            .catch((error) => res.status(500).json({ error }));
        });
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    const sauceObject = { ...req.body };
    Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    )
      .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
      .catch((error) => res.status(500).json({ error }));
  }
};

//Deletes a sauce
exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ message: "Sauce non trouvée !" });
      }
      //Gets the old image URL
      const filename = sauce.imageUrl.split("/images/")[1];
      //Deletes the old image
      fs.unlink(`images/${filename}`, () => {
        sauce
          .deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(500).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

//Gets all sauces
exports.getAllSauces = (req, res) => {
  Sauce.find()
    .then((sauces) => {
      return res.status(200).json(sauces);
    })
    .catch((error) => res.status(500).json({ error }));
};

//Définit le statut « Like » pour l' userId fourni. Si like = 1, l'utilisateur like la sauce. Si like = 0, l'utilisateur annule son like ou son dislike. Si like = -1,l'utilisateur n'aime pas (=
// dislike) la sauce. L'ID de l'utilisateur doit être ajouté ou retiré du tableau approprié. Cela permet de garder une trace de leurs préférences et les empêche de liker ou de ne pas disliker
//la même sauce plusieurs fois : un utilisateur ne peut avoir qu'une seule valeur pour chaque sauce. Le nombre total de « Like » et de « Dislike » est mis à jour à chaque nouvelle notation.
exports.likeSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ message: "Sauce non trouvée !" });
      }
      if (sauce.usersLiked.includes(req.body.userId)) {
        sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1);
        sauce.likes--;
      }
      if (sauce.usersDisliked.includes(req.body.userId)) {
        sauce.usersDisliked.splice(
          sauce.usersDisliked.indexOf(req.body.userId),
          1
        );
        sauce.dislikes--;
      }
      if (req.body.like === 1) {
        sauce.usersLiked.push(req.body.userId);
        sauce.likes++;
      }
      if (req.body.like === -1) {
        sauce.usersDisliked.push(req.body.userId);
        sauce.dislikes++;
      }
      sauce
        .save()
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
