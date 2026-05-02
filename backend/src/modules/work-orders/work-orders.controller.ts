import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as Service from "./work-orders.service.js";

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await Service.getAll(req.query));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await Service.getById(Number(req.params.id)));
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    res.status(201).json(await Service.create(req.body));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createFromTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId, ...data } = req.body;
    res.status(201).json(await Service.createFromTicket(Number(ticketId), data));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await Service.update(Number(req.params.id), req.body));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await Service.updateStatus(Number(req.params.id), req.body.status));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const addPartUsage = async (req: AuthRequest, res: Response) => {
  try {
    res.status(201).json(await Service.addPartUsage(Number(req.params.id), Number(req.body.partId), Number(req.body.quantityUsage)));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removePartUsage = async (req: AuthRequest, res: Response) => {
  try {
    await Service.removePartUsage(Number(req.params.usageId));
    res.json({ message: "Xoá thành công" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    await Service.remove(Number(req.params.id));
    res.json({ message: "Xoá thành công" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
