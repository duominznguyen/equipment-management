BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] VARCHAR(50) NOT NULL,
    [passwordHash] VARCHAR(255) NOT NULL,
    [email] VARCHAR(100) NOT NULL,
    [role] VARCHAR(20) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [User_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Customer] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [fullName] NVARCHAR(100) NOT NULL,
    [phone] VARCHAR(20) NOT NULL,
    [address] NVARCHAR(255) NOT NULL,
    [companyName] NVARCHAR(100),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Customer_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Customer_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Customer_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Technician] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [fullName] NVARCHAR(100) NOT NULL,
    [phone] VARCHAR(20) NOT NULL,
    [specialization] NVARCHAR(100),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Technician_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Technician_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Technician_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[DeviceCategory] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(255),
    CONSTRAINT [DeviceCategory_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Device] (
    [id] INT NOT NULL IDENTITY(1,1),
    [categoryId] INT NOT NULL,
    [customerId] INT NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [brand] NVARCHAR(100) NOT NULL,
    [model] NVARCHAR(100) NOT NULL,
    [serialNumber] VARCHAR(100) NOT NULL,
    [purchaseDate] DATETIME2,
    [status] VARCHAR(20) NOT NULL CONSTRAINT [Device_status_df] DEFAULT 'active',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Device_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Device_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Device_serialNumber_key] UNIQUE NONCLUSTERED ([serialNumber])
);

-- CreateTable
CREATE TABLE [dbo].[WarrantyContract] (
    [id] INT NOT NULL IDENTITY(1,1),
    [deviceId] INT NOT NULL,
    [customerId] INT NOT NULL,
    [contractNumber] VARCHAR(50) NOT NULL,
    [startDate] DATETIME2 NOT NULL,
    [endDate] DATETIME2 NOT NULL,
    [terms] NVARCHAR(max),
    [status] VARCHAR(20) NOT NULL CONSTRAINT [WarrantyContract_status_df] DEFAULT 'active',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [WarrantyContract_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [WarrantyContract_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [WarrantyContract_contractNumber_key] UNIQUE NONCLUSTERED ([contractNumber])
);

-- CreateTable
CREATE TABLE [dbo].[Ticket] (
    [id] INT NOT NULL IDENTITY(1,1),
    [customerId] INT NOT NULL,
    [deviceId] INT NOT NULL,
    [title] NVARCHAR(200) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [priority] VARCHAR(20) NOT NULL CONSTRAINT [Ticket_priority_df] DEFAULT 'medium',
    [status] VARCHAR(20) NOT NULL CONSTRAINT [Ticket_status_df] DEFAULT 'pending',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Ticket_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Ticket_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[MaintenanceRequest] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ticketId] INT,
    [deviceId] INT NOT NULL,
    [technicianId] INT NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [type] VARCHAR(20) NOT NULL,
    [status] VARCHAR(20) NOT NULL CONSTRAINT [MaintenanceRequest_status_df] DEFAULT 'pending',
    [startedAt] DATETIME2,
    [completedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [MaintenanceRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [MaintenanceRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[MaintenanceSchedule] (
    [id] INT NOT NULL IDENTITY(1,1),
    [deviceId] INT NOT NULL,
    [technicianId] INT NOT NULL,
    [scheduledDate] DATETIME2 NOT NULL,
    [description] NVARCHAR(255),
    [status] VARCHAR(20) NOT NULL CONSTRAINT [MaintenanceSchedule_status_df] DEFAULT 'upcoming',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [MaintenanceSchedule_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [MaintenanceSchedule_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Part] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(100) NOT NULL,
    [code] VARCHAR(50) NOT NULL,
    [unit] NVARCHAR(50) NOT NULL,
    [stockQuantity] INT NOT NULL CONSTRAINT [Part_stockQuantity_df] DEFAULT 0,
    [minQuantity] INT NOT NULL CONSTRAINT [Part_minQuantity_df] DEFAULT 0,
    [description] NVARCHAR(255),
    CONSTRAINT [Part_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Part_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[PartImport] (
    [id] INT NOT NULL IDENTITY(1,1),
    [importCode] VARCHAR(50) NOT NULL,
    [importedBy] INT NOT NULL,
    [supplier] NVARCHAR(100) NOT NULL,
    [importDate] DATETIME2 NOT NULL,
    [totalCost] DECIMAL(18,2) NOT NULL,
    [note] NVARCHAR(255),
    CONSTRAINT [PartImport_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PartImport_importCode_key] UNIQUE NONCLUSTERED ([importCode])
);

-- CreateTable
CREATE TABLE [dbo].[PartImportDetail] (
    [id] INT NOT NULL IDENTITY(1,1),
    [importId] INT NOT NULL,
    [partId] INT NOT NULL,
    [quantity] INT NOT NULL,
    [unitPrice] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [PartImportDetail_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PartExport] (
    [id] INT NOT NULL IDENTITY(1,1),
    [exportCode] VARCHAR(50) NOT NULL,
    [maintenanceRequestId] INT NOT NULL,
    [exportedBy] INT NOT NULL,
    [exportDate] DATETIME2 NOT NULL,
    [note] NVARCHAR(255),
    CONSTRAINT [PartExport_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PartExport_exportCode_key] UNIQUE NONCLUSTERED ([exportCode])
);

-- CreateTable
CREATE TABLE [dbo].[PartExportDetail] (
    [id] INT NOT NULL IDENTITY(1,1),
    [exportId] INT NOT NULL,
    [partId] INT NOT NULL,
    [quantity] INT NOT NULL,
    [unitPrice] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [PartExportDetail_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Customer] ADD CONSTRAINT [Customer_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Technician] ADD CONSTRAINT [Technician_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Device] ADD CONSTRAINT [Device_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[DeviceCategory]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Device] ADD CONSTRAINT [Device_customerId_fkey] FOREIGN KEY ([customerId]) REFERENCES [dbo].[Customer]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[WarrantyContract] ADD CONSTRAINT [WarrantyContract_deviceId_fkey] FOREIGN KEY ([deviceId]) REFERENCES [dbo].[Device]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[WarrantyContract] ADD CONSTRAINT [WarrantyContract_customerId_fkey] FOREIGN KEY ([customerId]) REFERENCES [dbo].[Customer]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Ticket] ADD CONSTRAINT [Ticket_customerId_fkey] FOREIGN KEY ([customerId]) REFERENCES [dbo].[Customer]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Ticket] ADD CONSTRAINT [Ticket_deviceId_fkey] FOREIGN KEY ([deviceId]) REFERENCES [dbo].[Device]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MaintenanceRequest] ADD CONSTRAINT [MaintenanceRequest_ticketId_fkey] FOREIGN KEY ([ticketId]) REFERENCES [dbo].[Ticket]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MaintenanceRequest] ADD CONSTRAINT [MaintenanceRequest_deviceId_fkey] FOREIGN KEY ([deviceId]) REFERENCES [dbo].[Device]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MaintenanceRequest] ADD CONSTRAINT [MaintenanceRequest_technicianId_fkey] FOREIGN KEY ([technicianId]) REFERENCES [dbo].[Technician]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MaintenanceSchedule] ADD CONSTRAINT [MaintenanceSchedule_deviceId_fkey] FOREIGN KEY ([deviceId]) REFERENCES [dbo].[Device]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MaintenanceSchedule] ADD CONSTRAINT [MaintenanceSchedule_technicianId_fkey] FOREIGN KEY ([technicianId]) REFERENCES [dbo].[Technician]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PartImport] ADD CONSTRAINT [PartImport_importedBy_fkey] FOREIGN KEY ([importedBy]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PartImportDetail] ADD CONSTRAINT [PartImportDetail_importId_fkey] FOREIGN KEY ([importId]) REFERENCES [dbo].[PartImport]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PartImportDetail] ADD CONSTRAINT [PartImportDetail_partId_fkey] FOREIGN KEY ([partId]) REFERENCES [dbo].[Part]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PartExport] ADD CONSTRAINT [PartExport_maintenanceRequestId_fkey] FOREIGN KEY ([maintenanceRequestId]) REFERENCES [dbo].[MaintenanceRequest]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PartExport] ADD CONSTRAINT [PartExport_exportedBy_fkey] FOREIGN KEY ([exportedBy]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PartExportDetail] ADD CONSTRAINT [PartExportDetail_exportId_fkey] FOREIGN KEY ([exportId]) REFERENCES [dbo].[PartExport]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PartExportDetail] ADD CONSTRAINT [PartExportDetail_partId_fkey] FOREIGN KEY ([partId]) REFERENCES [dbo].[Part]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
