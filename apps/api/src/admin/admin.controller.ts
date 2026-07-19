import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import {
  AdminCreateChallengeDto,
  AdminCreateCourseDto,
  AdminCreateLessonDto,
  AdminUpdateChallengeDto,
  AdminUpdateCourseDto,
  AdminUpdateLessonDto,
  AdminUpdateUserRoleDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('courses')
  listCourses() {
    return this.adminService.listCourses();
  }

  @Post('courses')
  createCourse(@Body() dto: AdminCreateCourseDto) {
    return this.adminService.createCourse(dto);
  }

  @Patch('courses/:slug')
  updateCourse(@Param('slug') slug: string, @Body() dto: AdminUpdateCourseDto) {
    return this.adminService.updateCourse(slug, dto);
  }

  @Delete('courses/:slug')
  deleteCourse(@Param('slug') slug: string) {
    return this.adminService.deleteCourse(slug);
  }

  @Post('courses/:slug/lessons')
  createLesson(@Param('slug') slug: string, @Body() dto: AdminCreateLessonDto) {
    return this.adminService.createLesson(slug, dto);
  }

  @Patch('courses/:slug/lessons/:lessonSlug')
  updateLesson(
    @Param('slug') slug: string,
    @Param('lessonSlug') lessonSlug: string,
    @Body() dto: AdminUpdateLessonDto,
  ) {
    return this.adminService.updateLesson(slug, lessonSlug, dto);
  }

  @Delete('courses/:slug/lessons/:lessonSlug')
  deleteLesson(@Param('slug') slug: string, @Param('lessonSlug') lessonSlug: string) {
    return this.adminService.deleteLesson(slug, lessonSlug);
  }

  @Get('challenges')
  listChallenges() {
    return this.adminService.listChallenges();
  }

  @Post('challenges')
  createChallenge(@Body() dto: AdminCreateChallengeDto) {
    return this.adminService.createChallenge(dto);
  }

  @Patch('challenges/:slug')
  updateChallenge(@Param('slug') slug: string, @Body() dto: AdminUpdateChallengeDto) {
    return this.adminService.updateChallenge(slug, dto);
  }

  @Delete('challenges/:slug')
  deleteChallenge(@Param('slug') slug: string) {
    return this.adminService.deleteChallenge(slug);
  }

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: AdminUpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto);
  }
}
