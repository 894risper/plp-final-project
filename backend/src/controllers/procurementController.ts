import { Request, Response } from "express";
import Procurement, { IProcurement } from "../models/procurement";

export const createProcurement = async (req: Request, res: Response): Promise<void> => {
  try {
    const procurement: IProcurement = new Procurement(req.body);
    await procurement.save();
    res.status(201).json(procurement);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getProcurements = async (req: Request, res: Response): Promise<void> => {
  try {
    const procurements = await Procurement.find();
    res.json(procurements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
