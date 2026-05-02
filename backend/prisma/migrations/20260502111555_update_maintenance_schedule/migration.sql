/*
  Warnings:

  - You are about to drop the column `createdAt` on the `MaintenanceSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDate` on the `MaintenanceSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `MaintenanceSchedule` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[MaintenanceSchedule] DROP CONSTRAINT [MaintenanceSchedule_createdAt_df];
ALTER TABLE [dbo].[MaintenanceSchedule] DROP CONSTRAINT [MaintenanceSchedule_status_df];
ALTER TABLE [dbo].[MaintenanceSchedule] DROP COLUMN [createdAt],
[scheduledDate],
[status];
ALTER TABLE [dbo].[MaintenanceSchedule] ADD [isContinueMaintain] BIT NOT NULL CONSTRAINT [MaintenanceSchedule_isContinueMaintain_df] DEFAULT 1,
[isHandled] BIT NOT NULL CONSTRAINT [MaintenanceSchedule_isHandled_df] DEFAULT 0,
[lastMaintenanceDate] DATETIME2 NOT NULL CONSTRAINT [MaintenanceSchedule_lastMaintenanceDate_df] DEFAULT CURRENT_TIMESTAMP,
[leadTimeDays] INT NOT NULL CONSTRAINT [MaintenanceSchedule_leadTimeDays_df] DEFAULT 7,
[nextMaintenanceDate] DATETIME2;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
