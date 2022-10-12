USE [PDS_TEST]

if OBJECT_ID (N'[PKDS].[USER]', N'U') IS NOT NULL
	Drop TABLE [PKDS].[USER]

if OBJECT_ID (N'[PKDS].[STATUS]', N'U') IS NOT NULL
Drop TABLE [PKDS].[STATUS]

if OBJECT_ID (N'[PKDS].[RECORD]', N'U') IS NOT NULL
	Drop TABLE [PKDS].[RECORD]
	
if OBJECT_ID (N'[PKDS].[AUTH_GROUP]', N'U') IS NOT NULL
	Drop TABLE [PKDS].[AUTH_GROUP]

if OBJECT_ID (N'[PKDS].[AUTH_RECORD]', N'U') IS NOT NULL
	Drop TABLE [PKDS].[AUTH_RECORD]

if OBJECT_ID (N'[PKDS].[OTP]', N'U') IS NOT NULL
	Drop TABLE [PKDS].[OTP]

DROP PROCEDURE IF EXISTS PKDS.AddUser;

DROP PROCEDURE IF EXISTS PKDS.AddRecord;

CREATE TABLE [PKDS].[USER] (
	[user_id][int] IDENTITY(1,1) PRIMARY KEY,
	[username][varchar](10) NOT NULL ,
	[display_name][varchar](200) NULL,
	[mail][varchar](50) NULL,
	[is_manager][bit] NULL,
	[is_hr][bit] NULL,
	[user_dn][varchar](200) NULL,
	[title][varchar](200) NULL,
	[description][varchar](200) NULL,
	[physicalDeliveryOfficeName][varchar](200) NULL,
	[memberOf][varchar](1000) NULL,
	[department][varchar](200) NULL,
	[directReports][varchar](1000) NULL,
	[manager_dn][varchar](200) NULL,
	[manager_user_id][int] REFERENCES [PKDS].[USER]([user_id]) NULL,
)
Create Unique Index UNQ_USER_01
On [PKDS].[USER]([username])

GO

CREATE PROCEDURE PKDS.AddUser
	@username [varchar] (10) ,
	@display_name [varchar] (200) ,
	@mail [varchar] (50) ,
	@is_manager [bit]  ,
	@is_hr [bit]  ,
	@user_dn [varchar] (200) ,
	@title [varchar] (200) ,
	@description [varchar] (200) ,
	@physicalDeliveryOfficeName [varchar] (200) ,
	@memberOf [varchar] (1000),
	@department [varchar] (200) ,
	@directReports [varchar] (1000),
	@manager_dn [varchar] (200)
AS
BEGIN 
     SET NOCOUNT ON;
	 IF EXISTS (SELECT [username] FROM [PKDS].[USER] WHERE [username] = @username)
			BEGIN
				UPDATE [PKDS].[USER]
					SET
					[display_name] = @display_name ,
					[mail] = @mail ,
					[is_manager] = @is_manager ,
					[is_hr] = @is_hr ,
					[user_dn] = @user_dn ,
					[title] = @title ,
					[description] = @description ,
					[physicalDeliveryOfficeName] = @physicalDeliveryOfficeName ,
					[memberOf] = @memberOf ,
					[department] = @department ,
					[directReports] = @directReports ,
					[manager_dn] = @manager_dn

					WHERE [username] = @username 

			END;
	ELSE
			BEGIN
				INSERT INTO [PKDS].[USER]
					(
					[username] ,
					[display_name] ,
					[mail] ,
					[is_manager] ,
					[is_hr] ,
					[user_dn] ,
					[title] ,
					[description] ,
					[physicalDeliveryOfficeName] ,
					[memberOf] ,
					[department] ,
					[directReports] ,
					[manager_dn]             
					)
				VALUES 
					( 
					@username ,
					@display_name ,
					@mail ,
					@is_manager ,
					@is_hr ,
					@user_dn ,
					@title ,
					@description ,
					@physicalDeliveryOfficeName ,
					@memberOf ,
					@department ,
					@directReports ,
					@manager_dn
					)
				END;
	END;

GO


CREATE TABLE [PKDS].[STATUS] (
	[status_id][int] IDENTITY(1,1) PRIMARY KEY,
	[status_name][varchar](20) NOT NULL ,
)


CREATE TABLE [PKDS].[RECORD] (
	[record_id][int] IDENTITY(1,1) PRIMARY KEY,
	[record_date][date] NOT NULL ,
	[user_id][int] REFERENCES [PKDS].[USER]([user_id]) NOT NULL ,
	[status_id][int] REFERENCES [PKDS].[STATUS]([status_id]) NOT NULL ,
)
Create Unique Index UNQ_RECORD_01
On [PKDS].[RECORD]([record_date], [user_id])

GO

CREATE PROCEDURE PKDS.AddRecord
	@record_date [date] ,
	@user_id [int] ,
	@status_id [int]
AS
BEGIN 
     SET NOCOUNT ON;
	 IF EXISTS (SELECT [record_date], [user_id] FROM [PKDS].[RECORD] WHERE [record_date] = @record_date AND [user_id] = @user_id)
			BEGIN
				UPDATE [PKDS].[RECORD]
					SET [status_id] = @status_id
					WHERE [record_date] = @record_date AND [user_id] = @user_id

			END;
	ELSE
			BEGIN
				INSERT INTO [PKDS].[RECORD]
					(
					 [record_date] ,
					 [user_id] ,
					 [status_id]             
					)
				VALUES 
					( 
					@record_date ,
					@user_id ,
					@status_id
					)
				END;
	END;

GO


CREATE TABLE [PKDS].[AUTH_GROUP] (
	[group_id][int] IDENTITY(1,1) PRIMARY KEY,
	[group_name][varchar] NOT NULL ,
	[group_dn][varchar] NOT NULL ,
)
Create Unique Index UNQ_AUTH_RECORD_01
On [PKDS].[AUTH_GROUP]([group_dn])





CREATE TABLE [PKDS].[AUTH_RECORD] (
	[auth_record_id][int] IDENTITY(1,1) PRIMARY KEY,
	[user_id][int] REFERENCES [PKDS].[USER]([user_id]) NOT NULL,
	[group_id][int] REFERENCES [PKDS].[AUTH_GROUP]([group_id]) NOT NULL,
)
Create Unique Index UNQ_AUTH_RECORD_01
On [PKDS].[AUTH_RECORD]([group_id], [user_id])





CREATE TABLE [PKDS].[OTP] (
	[otp_id][int] IDENTITY(1,1) PRIMARY KEY,
	[code][int] NOT NULL ,
	[user_id][int] REFERENCES [PKDS].[USER]([user_id]) NOT NULL ,
)



INSERT INTO [PKDS].[STATUS] ([status_name]) VALUES ('home');
INSERT INTO [PKDS].[STATUS] ([status_name]) VALUES ('office');
INSERT INTO [PKDS].[STATUS] ([status_name]) VALUES ('field');
INSERT INTO [PKDS].[STATUS] ([status_name]) VALUES ('off');


/* create view view_USER as
SELECT TOP (1000) 
       u1.[user_id]
      ,u1.[username]
      ,u1.[display_name]
      ,u1.[mail]
      ,u1.[is_manager]
      ,u1.[is_hr]
      ,u1.[user_dn]
      ,u1.[title]
      ,u1.[description]
      ,u1.[physicalDeliveryOfficeName]
      ,u1.[memberOf]
      ,u1.[department]
      ,u1.[directReports]
      ,u1.[manager_dn]
      ,u1.[manager_user_id]
	  --,u1.[manager_dn] as manager_dn_new
	  --,charIndex('=',u1.[manager_dn],0)
	  --,charIndex(',',u1.[manager_dn],0)
	  --,lower(SUBSTRING(u1.[manager_dn],charIndex('=',u1.[manager_dn],0)+1,charIndex(',',u1.[manager_dn],0)-charIndex('=',u1.[manager_dn],0)-1)) manager_name
	  ,u2.user_id manager_id
  FROM [PDS_TEST].[PKDS].[USER] u1 left join [PDS_TEST].[PKDS].[USER] u2
  on lower(SUBSTRING(u1.[manager_dn],charIndex('=',u1.[manager_dn],0)+1,charIndex(',',u1.[manager_dn],0)-charIndex('=',u1.[manager_dn],0)-1)) = lower(u2.display_name)
  --where u1.[user_id] in (450,220,513)

  select * from view_USER


  SELECT TOP (1000) 
       u1.[user_id]
      ,u1.[display_name]
      ,u1.[manager_user_id]
	  ,u2.user_id manager_id
	  FROM [PDS_TEST].[PKDS].[USER] u1 left join [PDS_TEST].[PKDS].[USER] u2
	  on u1.manager_dn = u2.user_dn

	  */

