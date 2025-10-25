using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class Seed
{
    public static async Task SeedUsers(UserManager<AppUser> userManager)
    {
        if (await userManager.Users.AnyAsync()) return;

        var memberData = await File.ReadAllTextAsync("Data/UserSeedData.json");

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var members = JsonSerializer.Deserialize<List<SeedUserDto>>(memberData, options);

        if (members == null)
        {
            Console.WriteLine("No members in seed data");
            return;
        }

        foreach (var member in members)
        {
            var user = new AppUser
            {
                Id = member.Id,
                Email = member.Email,
                UserName = member.Email,
                DisplayName = member.DisplayName,
                ImageUrl = member.ImageUrl,
                Member = new Member
                {
                    Id = member.Id,
                    DisplayName = member.DisplayName,
                    Description = member.Description,
                    DateOfBirth = member.DateOfBirth,
                    ImageUrl = member.ImageUrl,
                    Gender = member.Gender,
                    City = member.City,
                    Country = member.Country,
                    LastActive = member.LastActive,
                    Created = member.Created,
                }
            };
            user.Member.Photos.Add(new Photo
            {
                Url = member.ImageUrl!,
                MemberId = member.Id,
            });
            var result = await userManager.CreateAsync(user, "Pa$$w0rd");
            if (!result.Succeeded)
            {
                Console.WriteLine(result.Errors.First().Description);
            }

            await userManager.AddToRoleAsync(user, "Member");
        }

        var admin = new AppUser
        {
            UserName = "admin@test.com",
            Email = "admin@test.com",
            DisplayName = "Admin"
        };

        await userManager.CreateAsync(admin, "Pa$$w0rd");
        await userManager.AddToRolesAsync(admin, ["Admin", "Moderator"]);
        
        var openAI = new AppUser
        {
            DisplayName = "openai",
            Email = "openAI@test.com",
            UserName = "openAI@test.com",
            Member = new Member
            {
                DisplayName = "OpenAI",
                Gender = "Other",
                City = "San Francisco",
                Country = "USA",
                DateOfBirth = new DateOnly(1990, 1, 1)
            }
        };


        await userManager.CreateAsync(openAI, "Pa$$w0rd");
        await userManager.AddToRolesAsync(openAI, ["Moderator"]);

    }
}
