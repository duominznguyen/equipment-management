/*
  Warnings:

  - You are about to drop the column `address` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `MaintenanceSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `technicianId` on the `MaintenanceSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `importCode` on the `PartImport` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `Technician` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `WarrantyContract` table. All the data in the column will be lost.
  - You are about to drop the `MaintenanceRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PartExport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PartExportDetail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Customer] DROP CONSTRAINT [Customer_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Device] DROP CONSTRAINT [Device_categoryId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[MaintenanceRequest] DROP CONSTRAINT [MaintenanceRequest_deviceId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[MaintenanceRequest] DROP CONSTRAINT [MaintenanceRequest_technicianId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[MaintenanceRequest] DROP CONSTRAINT [MaintenanceRequest_ticketId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[MaintenanceSchedule] DROP CONSTRAINT [MaintenanceSchedule_technicianId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[PartExport] DROP CONSTRAINT [PartExport_exportedBy_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[PartExport] DROP CONSTRAINT [PartExport_maintenanceRequestId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[PartExportDetail] DROP CONSTRAINT [PartExportDetail_exportId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[PartExportDetail] DROP CONSTRAINT [PartExportDetail_partId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[PartImport] DROP CONSTRAINT [PartImport_importedBy_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[PartImportDetail] DROP CONSTRAINT [PartImportDetail_importId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[PartImportDetail] DROP CONSTRAINT [PartImportDetail_partId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Technician] DROP CONSTRAINT [Technician_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Ticket] DROP CONSTRAINT [Ticket_customerId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[WarrantyContract] DROP CONSTRAINT [WarrantyContract_customerId_fkey];

-- DropIndex
ALTER TABLE [dbo].[PartImport] DROP CONSTRAINT [PartImport_importCode_key];

-- AlterTable
ALTER TABLE [dbo].[Customer] DROP COLUMN [address],
[companyName];
ALTER TABLE [dbo].[Customer] ADD [additionalInfo] NVARCHAR(255);

-- AlterTable
ALTER TABLE [dbo].[Device] ADD [address] NVARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[MaintenanceSchedule] DROP COLUMN [description],
[technicianId];

-- AlterTable
ALTER TABLE [dbo].[PartImport] DROP COLUMN [importCode];

-- AlterTable
ALTER TABLE [dbo].[Technician] DROP COLUMN [specialization];

-- AlterTable
ALTER TABLE [dbo].[Ticket] DROP COLUMN [customerId];
ALTER TABLE [dbo].[Ticket] ADD CONSTRAINT [Ticket_updatedAt_df] DEFAULT CURRENT_TIMESTAMP FOR [updatedAt];

-- AlterTable
ALTER TABLE [dbo].[WarrantyContract] DROP COLUMN [customerId];

-- DropTable
DROP TABLE [dbo].[MaintenanceRequest];

-- DropTable
DROP TABLE [dbo].[PartExport];

-- DropTable
DROP TABLE [dbo].[PartExportDetail];

-- CreateTable
CREATE TABLE [dbo].[TechnicianSkill] (
    [id] INT NOT NULL IDENTITY(1,1),
    [technicianId] INT NOT NULL,
    [deviceCategoryId] INT NOT NULL,
    CONSTRAINT [TechnicianSkill_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[WorkOrder] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ticketId] INT,
    [maintenanceScheduleId] INT,
    [technicianId] INT NOT NULL,
    [workDescription] NVARCHAR(1000),
    [status] VARCHAR(20) NOT NULL CONSTRAINT [WorkOrder_status_df] DEFAULT 'pending',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [WorkOrder_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [startedAt] DATETIME2,
    [completedAt] DATETIME2,
    CONSTRAINT [WorkOrder_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PartUsage] (
    [id] INT NOT NULL IDENTITY(1,1),
    [workOrderId] INT NOT NULL,
    [partId] INT NOT NULL,
    [quantityUsage] INT NOT NULL,
    CONSTRAINT [PartUsage_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Customer] ADD CONSTRAINT [Customer_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Technician] ADD CONSTRAINT [Technician_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TechnicianSkill] ADD CONSTRAINT [TechnicianSkill_technicianId_fkey] FOREIGN KEY ([technicianId]) REFERENCES [dbo].[Technician]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TechnicianSkill] ADD CONSTRAINT [TechnicianSkill_deviceCategoryId_fkey] FOREIGN KEY ([deviceCategoryId]) REFERENCES [dbo].[DeviceCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Device] ADD CONSTRAINT [Device_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[DeviceCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[WorkOrder] ADD CONSTRAINT [WorkOrder_ticketId_fkey] FOREIGN KEY ([ticketId]) REFERENCES [dbo].[Ticket]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[WorkOrder] ADD CONSTRAINT [WorkOrder_maintenanceScheduleId_fkey] FOREIGN KEY ([maintenanceScheduleId]) REFERENCES [dbo].[MaintenanceSchedule]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[WorkOrder] ADD CONSTRAINT [WorkOrder_technicianId_fkey] FOREIGN KEY ([technicianId]) REFERENCES [dbo].[Technician]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PartUsage] ADD CONSTRAINT [PartUsage_workOrderId_fkey] FOREIGN KEY ([workOrderId]) REFERENCES [dbo].[WorkOrder]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PartUsage] ADD CONSTRAINT [PartUsage_partId_fkey] FOREIGN KEY ([partId]) REFERENCES [dbo].[Part]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PartImport] ADD CONSTRAINT [PartImport_importedBy_fkey] FOREIGN KEY ([importedBy]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PartImportDetail] ADD CONSTRAINT [PartImportDetail_importId_fkey] FOREIGN KEY ([importId]) REFERENCES [dbo].[PartImport]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PartImportDetail] ADD CONSTRAINT [PartImportDetail_partId_fkey] FOREIGN KEY ([partId]) REFERENCES [dbo].[Part]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
