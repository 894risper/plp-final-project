import Procurement from "../models/procurement.js";
export const createProcurement = async (req, res) => {
    try {
        const procurement = new Procurement(req.body);
        await procurement.save();
        res.status(201).json(procurement);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
export const getProcurements = async (req, res) => {
    try {
        const procurements = await Procurement.find();
        res.json(procurements);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
