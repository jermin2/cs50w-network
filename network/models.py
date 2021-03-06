from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField('User', related_name="following")

    def __str__(self):
        return f"{self.email}"

    def serialize(self):
        return {
            "id": self.id,
            "email":self.email, 
            "username": self.username,
            "followers": self.followers.count(),
            "following": self.following.count()
        }

    def is_following(self, user):
        try:
            u = self.following.all().get(id=user.id)
            return True
        except:
            return False


class Post(models.Model):
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    content = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name="likes")

    def __str__(self):
        return f"{self.author} : {self.content}"
    
    def serialize(self, user=None):

        if user != None:
            likes = {
            "is_liked": self.likes.filter(id=user.id).exists()
            }
        return {
            "id": self.id,
            "author": self.author.serialize(),
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes.count(),
            **likes
        }