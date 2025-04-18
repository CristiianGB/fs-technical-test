const mongoose = require("mongoose");

const BalanceEntrySchema = new mongoose.Schema({
    datetime: { type: Date, required: true, unique: true },
    values: { type: mongoose.Schema.Types.Mixed, default: {} },
    labels: { type: mongoose.Schema.Types.Mixed, default: {} },
    fetchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BalanceEntry", BalanceEntrySchema);
