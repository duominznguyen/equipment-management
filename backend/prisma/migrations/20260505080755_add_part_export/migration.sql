BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[PartExport] (
    [id] INT NOT NULL IDENTITY(1,1),
    [technicianId] INT NOT NULL,
    [workOrderId] INT,
    [exportDate] DATETIME2 NOT NULL CONSTRAINT [PartExport_exportDate_df] DEFAULT CURRENT_TIMESTAMP,
    [reason] NVARCHAR(255),
    [status] VARCHAR(20) NOT NULL CONSTRAINT [PartExport_status_df] DEFAULT 'pending',
    CONSTRAINT [PartExport_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PartExportDetail] (
    [id] INT NOT NULL IDENTITY(1,1),
    [exportId] INT NOT NULL,
    [partId] INT NOT NULL,
    [quantity] INT NOT NULL,
    CONSTRAINT [PartExportDetail_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[PartExport] ADD CONSTRAINT [PartExport_technicianId_fkey] FOREIGN KEY ([technicianId]) REFERENCES [dbo].[Technician]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PartExport] ADD CONSTRAINT [PartExport_workOrderId_fkey] FOREIGN KEY ([workOrderId]) REFERENCES [dbo].[WorkOrder]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PartExportDetail] ADD CONSTRAINT [PartExportDetail_exportId_fkey] FOREIGN KEY ([exportId]) REFERENCES [dbo].[PartExport]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PartExportDetail] ADD CONSTRAINT [PartExportDetail_partId_fkey] FOREIGN KEY ([partId]) REFERENCES [dbo].[Part]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
