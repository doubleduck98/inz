using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace inz.Server.Migrations
{
    /// <inheritdoc />
    public partial class Final2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_AspNetUsers_OwnerId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "AddedOnUtc",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "FileType",
                table: "Documents");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_AspNetUsers_OwnerId",
                table: "Documents",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_AspNetUsers_OwnerId",
                table: "Documents");

            migrationBuilder.AddColumn<DateTime>(
                name: "AddedOnUtc",
                table: "Documents",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "FileType",
                table: "Documents",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_AspNetUsers_OwnerId",
                table: "Documents",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
