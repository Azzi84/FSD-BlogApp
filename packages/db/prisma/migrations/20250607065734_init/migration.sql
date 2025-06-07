-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "urlId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "content" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "postId" INTEGER NOT NULL,
    "userIP" TEXT NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("postId","userIP")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "likes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_urlId_key" ON "Post"("urlId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
