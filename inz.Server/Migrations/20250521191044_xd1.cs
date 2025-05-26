using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace inz.Server.Migrations
{
    /// <inheritdoc />
    public partial class xd1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_AspNetUsers_OwnerId",
                table: "Documents");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:btree_gin", ",,")
                .Annotation("Npgsql:PostgresExtension:pg_trgm", ",,");

            migrationBuilder.AlterColumn<string>(
                name: "SourcePath",
                table: "Documents",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<string>(
                name: "FileType",
                table: "Documents",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedOnUtc",
                table: "Documents",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PatientId",
                table: "Documents",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Surname = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Dob = table.Column<DateTime>(type: "Date", nullable: false),
                    CoordinatingUserId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientId", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Patients_AspNetUsers_CoordinatingUserId",
                        column: x => x.CoordinatingUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Guardians",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Surname = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    PatientId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuardianId", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Guardians_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_PatientId",
                table: "Documents",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Guardians_Id",
                table: "Guardians",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Guardians_PatientId",
                table: "Guardians",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientNameSurname",
                table: "Patients",
                columns: new[] { "Name", "Surname" })
                .Annotation("Npgsql:IndexMethod", "gin")
                .Annotation("Npgsql:IndexOperators", new[] { "gin_trgm_ops" });

            migrationBuilder.CreateIndex(
                name: "IX_Patients_CoordinatingUserId",
                table: "Patients",
                column: "CoordinatingUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_Id",
                table: "Patients",
                column: "Id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_AspNetUsers_OwnerId",
                table: "Documents",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Patients_PatientId",
                table: "Documents",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_AspNetUsers_OwnerId",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Patients_PatientId",
                table: "Documents");

            migrationBuilder.DropTable(
                name: "Guardians");

            migrationBuilder.DropTable(
                name: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_Documents_PatientId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "DeletedOnUtc",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "PatientId",
                table: "Documents");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:btree_gin", ",,")
                .OldAnnotation("Npgsql:PostgresExtension:pg_trgm", ",,");

            migrationBuilder.AlterColumn<string>(
                name: "SourcePath",
                table: "Documents",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128);

            migrationBuilder.AlterColumn<int>(
                name: "FileType",
                table: "Documents",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(64)",
                oldMaxLength: 64);

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_AspNetUsers_OwnerId",
                table: "Documents",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
