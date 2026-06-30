const Accommodation = require('../models/Accommodation');

const createAccommodation = async (req, res) => {
  try {
    const {
      title, location, description, type, bedrooms, bathrooms,
      guests, price, weeklyDiscount, cleaningFee, serviceFee,
      occupancyTaxes, amenities, rating, reviews,
      enhancedCleaning, selfCheckIn, specificRatings,
    } = req.body;

    const images = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

    const accommodation = await Accommodation.create({
      title, location, description, type, bedrooms, bathrooms,
      guests, price, weeklyDiscount, cleaningFee, serviceFee,
      occupancyTaxes, amenities, images,
      rating, reviews, host: req.user?.username, host_id: req.user?._id,
      enhancedCleaning, selfCheckIn, specificRatings,
    });

    res.status(201).json(accommodation);
  } catch (error) {
    console.error('createAccommodation error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

const getAccommodations = async (req, res) => {
  try {
    const { location, type, minPrice, maxPrice, guests } = req.query;
    const filter = {};

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (guests) filter.guests = { $gte: Number(guests) };

    const accommodations = await Accommodation.find(filter).sort('-createdAt');
    res.json(accommodations);
  } catch (error) {
    console.error('getAccommodations error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAccommodationById = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    res.json(accommodation);
  } catch (error) {
    console.error('getAccommodationById error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    const updateData = { ...req.body };
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      updateData.images = [...(updateData.images || []), ...newImages];
    }

    const updated = await Accommodation.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    console.error('updateAccommodation error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

const deleteAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    await accommodation.deleteOne();
    res.json({ message: 'Accommodation removed' });
  } catch (error) {
    console.error('deleteAccommodation error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAccommodation,
  getAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
};
