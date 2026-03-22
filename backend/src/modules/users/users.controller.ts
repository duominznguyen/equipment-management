import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as UsersService from "./users.service.js";

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await UsersService.getAll(req.query));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await UsersService.getById(Number(req.params.id)));
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    res.status(201).json(await UsersService.create(req.body));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await UsersService.update(Number(req.params.id), req.body));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleActive = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await UsersService.toggleActive(Number(req.params.id)));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
