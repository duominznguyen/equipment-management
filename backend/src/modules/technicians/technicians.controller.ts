import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as TechniciansService from "./technicians.service.js";

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await TechniciansService.getAll(req.query));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await TechniciansService.getById(Number(req.params.id)));
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    res.status(201).json(await TechniciansService.create(req.body));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await TechniciansService.update(Number(req.params.id), req.body));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    await TechniciansService.remove(Number(req.params.id));
    res.json({ message: "Xoá thành công" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
