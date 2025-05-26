using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace inz.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddPatients : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Guardians");

            migrationBuilder.AddColumn<string>(
                name: "Apartment",
                table: "Patients",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Patients",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Patients",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "House",
                table: "Patients",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Patients",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "Patients",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "Patients",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ZipCode",
                table: "Patients",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "PatientContacts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Email = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    Phone = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    PatientId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientContactId", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientContacts_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PatientContacts_Id",
                table: "PatientContacts",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_PatientContacts_PatientId",
                table: "PatientContacts",
                column: "PatientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PatientContacts");

            migrationBuilder.DropColumn(
                name: "Apartment",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "House",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "Province",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "Street",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "ZipCode",
                table: "Patients");

            migrationBuilder.CreateTable(
                name: "Guardians",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Surname = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false)
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
                name: "IX_Guardians_Id",
                table: "Guardians",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Guardians_PatientId",
                table: "Guardians",
                column: "PatientId");
        }
    }
}
