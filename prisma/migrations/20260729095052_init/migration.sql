-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Ganesh Varma',
    "initials" TEXT NOT NULL DEFAULT 'GV',
    "email" TEXT NOT NULL DEFAULT 'gp61080@gmail.com',
    "location" TEXT NOT NULL DEFAULT 'Andhra Pradesh, IN',
    "resumeUrl" TEXT NOT NULL DEFAULT '#',
    "githubUrl" TEXT NOT NULL DEFAULT '#',
    "linkedinUrl" TEXT NOT NULL DEFAULT '#',
    "twitterUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModeContent" (
    "id" TEXT NOT NULL,
    "modeId" TEXT NOT NULL,
    "index" TEXT NOT NULL DEFAULT '01',
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL DEFAULT '#a56ce8',
    "role" TEXT NOT NULL DEFAULT '',
    "heroTitlePrefix" TEXT NOT NULL DEFAULT '',
    "heroTitleAccent" TEXT NOT NULL DEFAULT '',
    "heroTitleSuffix" TEXT NOT NULL DEFAULT '',
    "lede" TEXT NOT NULL DEFAULT '',
    "contactHeading" TEXT NOT NULL DEFAULT 'Let''s build something.',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModeContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaItem" (
    "id" TEXT NOT NULL,
    "modeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MetaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillGroup" (
    "id" TEXT NOT NULL,
    "modeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkillGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 70,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "modeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "stack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "url" TEXT,
    "imageUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "modeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "year" TEXT,
    "url" TEXT,
    "imageUrl" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL,
    "modeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "year" TEXT,
    "url" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Paper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "modeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "year" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionConfig" (
    "id" TEXT NOT NULL,
    "modeId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SectionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeToken" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ThemeToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ModeContent_modeId_key" ON "ModeContent"("modeId");

-- CreateIndex
CREATE UNIQUE INDEX "SectionConfig_modeId_section_key" ON "SectionConfig"("modeId", "section");

-- CreateIndex
CREATE UNIQUE INDEX "ThemeToken_key_key" ON "ThemeToken"("key");

-- AddForeignKey
ALTER TABLE "MetaItem" ADD CONSTRAINT "MetaItem_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "ModeContent"("modeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillGroup" ADD CONSTRAINT "SkillGroup_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "ModeContent"("modeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SkillGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "ModeContent"("modeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "ModeContent"("modeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paper" ADD CONSTRAINT "Paper_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "ModeContent"("modeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "ModeContent"("modeId") ON DELETE CASCADE ON UPDATE CASCADE;
