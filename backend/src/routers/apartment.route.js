const express = require("express");
const router = express.Router();
const {
  getAllRentalApartments,
  getAllSaleApartments,
  getApartmentByIdRent,
  getApartmentByIdSale,
  postUserMatchApartmentsForm,
  getApartmentByIdAll,
  explainApartmentMatch,
} = require("../controllers/apartment.controller");

router.get("/rent/:id", getApartmentByIdRent);
router.get("/sale/:id", getApartmentByIdSale);
router.get("/all/:id", getApartmentByIdAll);
router.get("/rent", getAllRentalApartments);
router.get("/sale", getAllSaleApartments);
router.post("/match", postUserMatchApartmentsForm);
router.post("/:id/explain-match", explainApartmentMatch);

module.exports = router;
