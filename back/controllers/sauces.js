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

//Creates a new sauce and uploads the image
exports.createSauce = (req, res) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        //Image URL
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(500).json({ error }));
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
exports.getAllSauces = (res) => {
  Sauce.find() 
    .then((sauces) => {
      return res.status(200).json(sauces);
    })
    .catch((error) => res.status(500).json({ error }));
};

//"Likes" and "Dislikes" (+1, 0, -1)

//Adds a like
exports.likeSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ message: "Sauce non trouvée !" });
      }})
    .catch((error) => res.status(500).json({ error }));
};
