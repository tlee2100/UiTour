using System.ComponentModel.DataAnnotations;

public class UpdateUserRoleDto
{
    [Required, StringLength(20)]
    public string Role { get; set; } // Ví dụ: "Admin", "Host", "User"
}
