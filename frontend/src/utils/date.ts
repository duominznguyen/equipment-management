import dayjs from "dayjs";

export const formatDate = (date: string | Date) => dayjs(date).format("DD/MM/YYYY");

export const formatDateTime = (date: string | Date) => dayjs(date).format("DD/MM/YYYY HH:mm");
