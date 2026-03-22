import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as Service from "./maintenance-requests.service.js";

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
    res
      .status(201)
      .json(
        await Service.createFromTicket(Number(req.params.ticketId), req.body),
      );
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
    res.json(
      await Service.updateStatus(Number(req.params.id), req.body.status),
    );
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
