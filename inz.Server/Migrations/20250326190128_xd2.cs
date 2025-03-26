using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace inz.Server.Migrations
{
    /// <inheritdoc />
    public partial class xd2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                schema: "identity",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Surname",
                schema: "identity",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                schema: "identity",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Surname",
                schema: "identity",
                table: "AspNetUsers");
        }
    }
}
